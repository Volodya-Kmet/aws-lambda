import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { DatabaseModule } from '../../shared/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { createHttpLogger } from '../../shared/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(DatabaseModule.getTypeOrmOptions()),
    LoggerModule.forRoot({
      pinoHttp: createHttpLogger(),
      forRoutes: ['*'],
    }),
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
