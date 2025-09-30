import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { OpenSearchModule } from '../../../shared/open-search/opensearch.module';
import { MulterModule } from '@nestjs/platform-express';
import { UserRepository } from './users.repository';

@Module({
  imports: [OpenSearchModule, MulterModule.register()],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
