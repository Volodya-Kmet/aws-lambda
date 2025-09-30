import pinoHttp from 'pino-http';
import { Context } from 'aws-lambda';

export function createHttpLogger(context?: Context) {
  return pinoHttp({
    serializers: {
      req: (req) => ({
        id: req.id,
        method:
          (req.headers['x-http-method'] as string) || (req.headers['x-http-method-override'] as string) || req.method,
        url: req.url,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
    customProps: () => ({
      lambdaName: context?.functionName || process.env.AWS_LAMBDA_FUNCTION_NAME || 'local-lambda',
      stage: process.env.STAGE || 'local',
      requestId: context?.awsRequestId || 'local-request',
    }),
    autoLogging: false,
  });
}
