import dataSource from '../../shared/database/datasource.config';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Logger } from '../../shared/logger/logger';

module.exports.main = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<Partial<APIGatewayProxyResult>> => {
  const logger = new Logger(context);
  try {
    const ds = await dataSource.initialize();
    await ds.runMigrations();
    await ds.destroy();

    return { statusCode: 200 };
  } catch (error: any) {
    const { message, stack } = error || {};
    logger.error(
      {
        error: {
          message,
          stack,
        },
      },
      'Error on migration run',
    );

    return { statusCode: 500 };
  }
};
