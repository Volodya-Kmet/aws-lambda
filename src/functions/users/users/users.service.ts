import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { validate } from 'class-validator';
import { UserToCreateDto } from './dtos/user-to-create.dto';
import { Logger } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { OpenSearchService } from '../../../shared/open-search/open-search.service';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { parser } from 'stream-json';
import { chain } from 'stream-chain';
import { retry } from '../../../shared/helpers/retry.helper';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  public constructor(
    private readonly userRepository: UserRepository,
    private readonly osService: OpenSearchService,
  ) {}

  public async processUserFile(file: Express.Multer.File): Promise<void> {
    const validUsersMap: Map<string, UserToCreateDto> = new Map();
    const UPSERT_CHUNK_SIZE = 50;
    const usersCounter = {
      upserted: 0,
      failed: 0,
    };

    const pipeline = chain([Readable.from(file.buffer), parser(), streamArray()]);

    for await (const { value } of pipeline) {
      await this.handleUser(value, validUsersMap, usersCounter, UPSERT_CHUNK_SIZE);
    }

    if (validUsersMap.size) await this.bulkUpsert([...validUsersMap.values()], usersCounter);

    this.logger.log({ ...usersCounter }, 'Processing of users data file finished');
  }

  private handleUser = async (
    value: UserToCreateDto,
    validUsersMap: Map<string, UserToCreateDto>,
    usersCounter: { upserted: number; failed: number },
    UPSERT_CHUNK_SIZE: number,
  ): Promise<void> => {
    const userDto = UserToCreateDto.toDto(value);
    const errors = await validate(userDto);
    if (errors.length) {
      errors.forEach((error) => {
        this.logger.warn({ invalidUser: JSON.stringify(error.constraints) }, 'Invalid user record');
      });
      usersCounter.failed++;
      return;
    }

    validUsersMap.set(userDto.email, userDto);
    if (validUsersMap.size === UPSERT_CHUNK_SIZE) {
      const userToUpsert = [...validUsersMap.values()];
      validUsersMap.clear();
      await this.bulkUpsert(userToUpsert, usersCounter);
    }
  };

  private async bulkUpsert(users: UserToCreateDto[], counter: { upserted: number; failed: number }) {
    const queryRunner = await this.userRepository.prepareTransaction();
    await queryRunner.startTransaction();

    // Here, I chose consistency in the database and OpenSearch. In my opinion, this is a question for the business.
    // If some differences are fine, then we may create a job to synchronize the data once a day, and remove this transaction or find some other solutions.
    try {
      const openSearchPayload = users.flatMap(UserToCreateDto.toOpenSearchBulkUpsert);

      await Promise.all([
        this.userRepository.upsertUsers(users),
        retry(this.osService.bulk.bind(this.osService, openSearchPayload), 3, 500),
      ]);
      await queryRunner.commitTransaction();
      counter.upserted = counter.upserted + users.length;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        { error: { message: error.message, stack: error.stack } },
        "[upsertUsers] couldn't upsert records",
      );
      counter.failed = counter.failed + users.length;
    } finally {
      await queryRunner.release();
    }
  }
}
