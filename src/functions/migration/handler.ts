import dataSource from '../../shared/database/datasource.config';
import { createHttpLogger } from '../../shared/logger/logger.module';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Callback, Context } from 'aws-lambda';

module.exports.main = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
): Promise<Partial<APIGatewayProxyResult>> => {
  const logger = createHttpLogger(context).logger;
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
