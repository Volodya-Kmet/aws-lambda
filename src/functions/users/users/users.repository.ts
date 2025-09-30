import { DataSource, InsertResult, QueryRunner, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserToCreateDto } from './dtos/user-to-create.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(UserEntity, dataSource.getRepository(UserEntity).manager);
  }

  public async prepareTransaction(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    return queryRunner;
  }

  public async upsertUsers(users: UserToCreateDto[], queryRunner?: QueryRunner): Promise<InsertResult> {
    const result =  (queryRunner?.manager.getRepository(UserEntity) || this)
      .upsert(users, { conflictPaths: ['email'], skipUpdateIfNoValuesChanged: true })

    return result
  }
}
