import { InternalServerErrorException, Injectable } from '@nestjs/common';
import { Client, ClientOptions } from '@opensearch-project/opensearch';
import { IBulkInput } from './types/bulkInput.interface';
import AWS from 'aws-sdk';
import { Logger } from '@nestjs/common';
import createAwsOpensearchConnector from 'aws-opensearch-connector';
import { ConfigService } from '../configs/config.service';

@Injectable()
export class OpenSearchService {
  private readonly client: Client;

  private readonly logger = new Logger(OpenSearchService.name);

  public constructor() {
    const configs = new ConfigService();
    const { env, openSearch } = configs;
    const { host: node, username, password } = openSearch;

    const options =
      env !== 'local'
        ? { ...createAwsOpensearchConnector(AWS.config), node }
        : {
            node,
            auth: { username, password },
            ssl: { rejectUnauthorized: false },
          };
    this.client = new Client(options as ClientOptions);
  }

  async bulk(body: Array<IBulkInput | Record<string, any>>): Promise<void> {
    const { body: responseBody } = await this.client.bulk({ refresh: true, body });

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
