import { InternalServerErrorException, Logger } from '@nestjs/common';
import { OpenSearchService } from './open-search.service';

jest.mock('../configs/config.service', () => {
  return {
    ConfigService: jest.fn().mockImplementation(() => ({
      env: 'local',
      openSearch: {
        host: 'http://localhost:9200',
        username: 'user',
        password: 'pass',
      },
    })),
  };
});

describe('OpenSearchService', () => {
  let service: OpenSearchService;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      bulk: jest.fn(),
      search: jest.fn(),
    };

    service = new OpenSearchService();

    (service as any).client = mockClient;
    (service as any).logger = { warn: jest.fn(), error: jest.fn() } as unknown as Logger;
  });

  describe('bulk', () => {
    it('should call bulk with refresh true and not throw on success', async () => {
      mockClient.bulk.mockResolvedValue({ body: { errors: false, items: [] } });

      await expect(service.bulk([{ index: { _index: 'users' } }])).resolves.not.toThrow();
      expect(mockClient.bulk).toHaveBeenCalledWith({
        refresh: true,
        body: [{ index: { _index: 'users' } }],
      });
    });

    it('should throw InternalServerErrorException if bulk has errors', async () => {
      mockClient.bulk.mockResolvedValue({
        body: { errors: true, items: [{ index: { error: 'some error' } }] },
      });

      await expect(service.bulk([])).rejects.toBeInstanceOf(InternalServerErrorException);
      expect((service as any).logger.warn).toHaveBeenCalledWith(
        { errorItems: [{ index: { error: 'some error' } }] },
        '[OpenSearch] Bulk upsert errors',
      );
    });
  });

  describe('search', () => {
    it('should return mapped hits from search', async () => {
      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [
              { _source: { name: 'Alice', email: 'test@email.com' } },
              { _source: { name: 'Bob', email: 'alice@test.com' } },
            ],
          },
        },
      });

      const result = await service.search('users', 'alice');
      expect(result).toEqual([
        { name: 'Alice', email: 'test@email.com' },
        { name: 'Bob', email: 'alice@test.com' },
      ]);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'users',
        body: { query: { match: { summary: 'alice' } } },
      });
    });

    it('should log error and return undefined if search fails', async () => {
      mockClient.search.mockRejectedValue(new Error('boom!'));

      const result = await service.search('users', 'alice');
      expect(result).toBeUndefined();
      expect((service as any).logger.error).toHaveBeenCalledWith(
        { error: { message: 'boom!', stuck: undefined } },
        "couldn't get data from opensearch",
      );
    });
  });
});
