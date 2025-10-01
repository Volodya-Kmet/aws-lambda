import { Logger } from '@nestjs/common';
/**
 * Retry helper
 * @param action - async function to retry
 * @param retries - number of retries
 * @param interval - delay between retries in ms
 */
export async function retry<T>(action: () => Promise<T>, retries: number = 3, interval: number = 500): Promise<T> {
  const logger = new Logger('retry');
  let lastError: any;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        logger.warn(`[retry] Attempt ${attempt} failed: ${error.message}. Retrying in ${interval}ms...`);
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }
  }

  throw lastError;
}
