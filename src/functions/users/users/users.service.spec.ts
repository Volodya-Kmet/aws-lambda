import { UsersService } from './users.service';
import { UserRepository } from './users.repository';
import { OpenSearchService } from '../../../shared/open-search/open-search.service';
import { mock } from 'jest-mock-extended';
import { Logger } from '@nestjs/common';
import { InsertResult } from 'typeorm';

describe('UsersService (integration with file buffer)', () => {
  let service: UsersService;
  let userRepository: ReturnType<typeof mock<UserRepository>>;
  let osService: ReturnType<typeof mock<OpenSearchService>>;

  beforeEach(() => {
    userRepository = mock<UserRepository>();
    osService = mock<OpenSearchService>();

    service = new UsersService(userRepository, osService);

    (service as any).logger = mock<Logger>();

    userRepository.prepareTransaction.mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process valid users file and call upsert + bulk', async () => {
    const usersData = [
      { email: 'alice@example.com', name: 'Alice', roles: ['viewer'], joined: '2021-04-02' },
      { email: 'bob@example.com', name: 'Bob', lastName: 'B', roles: ['viewer'], joined: '2021-04-05' },
    ];

    const buffer = Buffer.from(JSON.stringify(usersData));
    const file: Express.Multer.File = {
      buffer,
      originalname: 'users.json',
      mimetype: 'application/json',
      size: buffer.length,
      fieldname: 'file',
      encoding: '',
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    userRepository.upsertUsers.mockResolvedValue(mock<InsertResult>());
    osService.bulk.mockResolvedValue(undefined);

    await service.processUserFile(file);

    expect(userRepository.upsertUsers).toHaveBeenCalledWith(expect.any(Array));
    expect(osService.bulk).toHaveBeenCalledWith(expect.any(Array));
    expect((service as any).logger.log).toHaveBeenCalledWith(
      expect.objectContaining({ upserted: 2, failed: 0 }),
      'Processing of users data file finished',
    );
  });

  it('should increment failed counter for invalid users', async () => {
    const invalidData = [{ email: 'invalid-email', firstName: '', lastName: '' }];

    const buffer = Buffer.from(JSON.stringify(invalidData));
    const file: Express.Multer.File = {
      buffer,
      originalname: 'invalid.json',
      mimetype: 'application/json',
      size: buffer.length,
      fieldname: 'file',
      encoding: '',
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    await service.processUserFile(file);

    expect(userRepository.upsertUsers).not.toHaveBeenCalled();
    expect(osService.bulk).not.toHaveBeenCalled();
    expect((service as any).logger.warn).toHaveBeenCalled();
    expect((service as any).logger.log).toHaveBeenCalledWith(
      expect.objectContaining({ upserted: 0, failed: 1 }),
      'Processing of users data file finished',
    );
  });
});
