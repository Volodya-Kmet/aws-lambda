import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({})
export class DatabaseModule {
  public static getTypeOrmOptions(): TypeOrmModuleOptions {
    const type = 'mysql';

    const host = process.env.DB_HOST || 'localhost';
    const port = Number.parseInt(process.env.DB_PORT || '3306', 10);
    const username = process.env.DB_USER || 'username';
    const password = process.env.DB_PASSWORD || 'password';
    const database = process.env.DB_NAME || 'db';
    const migrationsRun = process.env.TYPEORM_MIGRATIONS_RUN === 'true';

    return {
      type,
      host,
      port,
      username,
      password,
      database,
      migrationsRun,
      entities: ['dist/functions/**/*.entity.js'],
      migrations: ['dist/migrations/*.js'],
      synchronize: false,
      cli: {
        migrationsDir: 'migrations',
      },
    } as TypeOrmModuleOptions;
  }

  public static forRootAsync(): DynamicModule {
    return TypeOrmModule.forRootAsync({
      name: 'my-sql',
      useFactory: async () => {
        let host: string | undefined;
        let username: string | undefined;
        let password: string | undefined;

        if (process.env.DB_SECRET_ARN && process.env.DB_PROXY_ENDPOINT) {
          const client = new SecretsManagerClient({
            region: process.env.AWS_REGION || 'us-east-1',
          });
          const secret = await client.send(
            new GetSecretValueCommand({
              SecretId: process.env.DB_SECRET_ARN,
            }),
          );

          const secrets = JSON.parse(secret.SecretString!) as {
            username: string;
            password: string;
          };

          host = process.env.DB_PROXY_ENDPOINT!;
          username = secrets.username;
          password = secrets.password;
        }

        const config = {
          ...DatabaseModule.getTypeOrmOptions(),
          ...(host ? { host } : {}),
          ...(username ? { username } : {}),
          ...(password ? { password } : {}),
        };
        console.log(config, 'db config');
        return config as TypeOrmModuleOptions;
      },
    });
  }
}
