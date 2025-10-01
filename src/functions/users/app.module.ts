import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { DatabaseModule } from '../../shared/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomConfigModule } from '../../shared/configs/config.module';

@Module({
  imports: [
    CustomConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(DatabaseModule.getTypeOrmOptions()),
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
