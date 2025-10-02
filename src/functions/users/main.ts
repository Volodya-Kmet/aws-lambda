import { Handler, Context, Callback, APIGatewayProxyEvent } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { Logger } from '../../shared/logger/logger';

let cachedServer: Handler;

async function bootstrap(context: Context): Promise<Handler> {
  const apiPrefix = 'api';
  const expressApp = express();

  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  nestApp.useLogger(new Logger(context));
  nestApp.setGlobalPrefix(apiPrefix, { exclude: ['/'] });

  const config = new DocumentBuilder()
    .setTitle('NestJS Lambda API')
    .setDescription('API for Lambda')
    .setVersion(process.env.npm_package_version || '0.0.0')
    .addServer(apiPrefix)
    .build();

  const document = SwaggerModule.createDocument(nestApp, config, {
    ignoreGlobalPrefix: true,
  });

  SwaggerModule.setup('api-docs', nestApp, document);

  await nestApp.init();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
): Promise<Handler | undefined> => {
  if (event.path === '' || event.path === undefined) event.path = '/';

  if (!cachedServer) cachedServer = await bootstrap(context);

  return cachedServer(event, context, callback);
};
