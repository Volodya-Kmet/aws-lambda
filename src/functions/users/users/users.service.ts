import { Injectable, InternalServerErrorException, ValidationError } from '@nestjs/common';
import { Readable } from 'stream';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserToCreateDto } from './dtos/user-to-create.dto';
import { PinoLogger } from 'nestjs-pino';
import { UserRepository } from './users.repository';
import { OpenSearchService } from '../../../shared/open-search/openseearch.service';

@Injectable()
export class UsersService {
  public constructor(
    private readonly logger: PinoLogger,
    private readonly userRepository: UserRepository,
    private readonly osService: OpenSearchService,
  ) {}

  public async processUserFile(file: Express.Multer.File): Promise<void> {
    const fileStream = Readable.from(file.buffer);

    const validUsersMap: Map<string, UserToCreateDto> = new Map();
    const tasks: Promise<any>[] = [];
    const UPSERT_CHUNK_SIZE = 50;
    let usersCounter = {
      upserted: 0,
      failed: 0,
    };

    const handleData = async (values: UserToCreateDto[]): Promise<void> => {
      values.map(async (value) => {
        const userDto = plainToInstance(UserToCreateDto, value);
        const errors = await validate(userDto);

        if (errors.length) {
          errors.forEach((error) => this.logger.warn(error, 'Invalid user record'));
          usersCounter.failed++;
          return;
        }

        validUsersMap.set(userDto.email, userDto);

        if (validUsersMap.size === UPSERT_CHUNK_SIZE) {
          const userToUpsert = [...validUsersMap.values()];
          validUsersMap.clear();
          return this.bulkUpsert(userToUpsert, usersCounter);
        }
      })
    };

    fileStream.on('data', async (chunk) => {
      tasks.push(handleData(JSON.parse(chunk.toString())));
    });

    fileStream.on('error', async (error) => {
      this.logger.error({ error: { message: error.message, stack: error.stack } }, 'Internal server error');
    });

    fileStream.on('end', async (end) => {
      if (tasks.length) await Promise.all(tasks);
      if (validUsersMap.size) await this.bulkUpsert([...validUsersMap.values()], usersCounter);

      this.logger.info(
        { ...usersCounter },
        'Processing of users data file finished',
      );
    });
  }

  private async bulkUpsert(users: UserToCreateDto[], counter: { upserted:number, failed: number }) {

    const queryRunner = await this.userRepository.prepareTransaction();
    await queryRunner.startTransaction();

    try {
      await Promise.all([
        this.userRepository.upsertUsers(users).catch((error) => { console.log(error, '>>>>ER<<<<<'); }),
        await this.osService.bulk(users.flatMap(UserToCreateDto.toOpenSearchBulkUpsert)),
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
