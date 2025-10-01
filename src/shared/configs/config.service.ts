import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ConfigService as ConfigServiceBase } from '@nestjs/config';
import { Logger } from '@nestjs/common';

dotenv.config();

interface IDataBaseOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

interface IOpenSearchConfig {
  host: string;
  username?: string;
  password?: string;
}

@Injectable()
export class ConfigService extends ConfigServiceBase {
  private readonly logger = new Logger(ConfigService.name);

  public readonly env: string;

  public readonly dataBase: IDataBaseOptions;

  public readonly openSearch: IOpenSearchConfig;

  public constructor() {
    super();

    this.env = this.getEnv('STAGE', 'local');

    this.dataBase = {
      host: this.getEnv('DB_HOST', 'localhost'),
      port: Number.parseInt(this.getEnv('DB_PORT', '3306'), 10),
      username: this.getEnv('DB_USER', 'username'),
      password: this.getEnv('DB_PASSWORD', 'password'),
      database: this.getEnv('DB_NAME', 'db'),
    };

    this.openSearch = {
      host: this.getEnv('OPENSEARCH_HOST', 'localhost'),
      username: this.getEnv('OPENSEARCH_USER', 'username'),
      password: this.getEnv('OPENSEARCH_PASS', 'password'),
    };
  }

  public getEnv(key: string, defaultValue?: string): string {
    let envVar = process.env[key];
    if (!envVar || !envVar.trim()) envVar = defaultValue;
    if (!envVar || !envVar.trim()) {
      this.logger.error({ environmentVariable: key }, 'Environment variable cannot be empty.');
      process.exit(0);
    }
    return String(envVar);
  }
}
