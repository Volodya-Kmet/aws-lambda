import { Module } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { ConfigService } from '../configs/config.service';

@Module({})
export class DatabaseModule {
  public static getTypeOrmOptions(): TypeOrmModuleOptions {
    const { host, port, database, username, password } = new ConfigService().dataBase;
    const type = 'mysql';
    const migrationsRun = process.env.TYPEORM_MIGRATIONS_RUN === 'true';

    return {
      type,
      host,
      port,
      username,
      password,
      database,
      migrationsRun,
      entities: ['dist/src/functions/**/*.entity.js'],
      migrations: ['dist/migrations/*.js'],
      synchronize: false,
      cli: {
        migrationsDir: 'migrations',
      },
    } as TypeOrmModuleOptions;
  }
}
