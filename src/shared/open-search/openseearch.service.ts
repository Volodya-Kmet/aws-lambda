import { InternalServerErrorException, Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { IBulkInput } from './types/bulkInput.interface';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class OpenSearchService {
  private readonly client: Client;

  public constructor(private readonly logger: PinoLogger) {
    this.client = new Client({
      node: process.env.OPENSEARCH_HOST,
      auth: {
        username: process.env.OPENSEARCH_USER!,
        password: process.env.OPENSEARCH_PASS!,
      },
      ssl: { rejectUnauthorized: false },
    });
  }

  async bulk(body: Array<IBulkInput | Record<string, any>>) {
    const { body: responseBody } = await this.client.bulk({ refresh: true, body });
    console.log(responseBody.items, 'responseBody<<<<')
    if (responseBody.errors) {
      this.logger.warn({ errorItems: responseBody.items }, '[OpenSearch] Bulk upsert errors');
      throw new InternalServerErrorException();
    }
  }

  async search(index: string, query: string) {
    try {
      const { body } = await this.client.search({
        index,
        body: {
          query: {
            match: { summary: query },
          },
        },
      });

      return body.hits.hits.map((hit: any) => hit._source);
    } catch (error) {
      this.logger.error({ error: { message: error.message, stuck: error.stuck } }, "couldn't get data from opensearch");
    }
  }
}
