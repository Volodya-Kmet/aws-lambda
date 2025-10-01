import { ConsoleLogger } from '@nestjs/common';
import { Context } from 'aws-lambda';

export class Logger extends ConsoleLogger {
  public constructor(context: Context) {
    super({
      colors: true,
      prefix: context.functionName,
      logLevels: ['log', 'warn', 'error'],
    });
  }
}
