import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserToCreateDto } from './user-to-create.dto';
import { UserRolesEnum } from '../../constants/user-roles.enum';
import { OPEN_SEARCH_USERS_INDEX } from '../../constants/open-serach-index.constant';

describe('UserToCreateDto', () => {
  it('should transform email correctly', async () => {
    const dto = plainToInstance(UserToCreateDto, {
      name: 'Alice',
      email: ' alice(at)example.com ',
      roles: 'admin',
      joined: '2021-04-01',
    });

    expect(dto.email).toBe('alice@example.com');
  });

  it('should split roles string into array', async () => {
    const dto = plainToInstance(UserToCreateDto, {
      name: 'Bob',
      email: 'bob@example.com',
      roles: 'admin, editor , viewer',
      joined: '2021-04-01',
    });

    expect(dto.roles).toEqual(['admin', 'editor', 'viewer']);
  });

  it('should keep array of roles intact', async () => {
    const dto = plainToInstance(UserToCreateDto, {
      name: 'Charlie',
      email: 'charlie@example.com',
      roles: [UserRolesEnum.ADMIN, UserRolesEnum.EDITOR],
      joined: '2021-04-01',
    });

    expect(dto.roles).toEqual([UserRolesEnum.ADMIN, UserRolesEnum.EDITOR]);
  });

  it('should parse date from ISO format', async () => {
    const dto = plainToInstance(UserToCreateDto, {
      name: 'Dan',
      email: 'dan@example.com',
      roles: ['admin'],
      joined: '2021-04-01',
    });

    expect(dto.joined).toBe('2021-04-01T00:00:00.000Z');
  });

  it('should parse date from natural format', async () => {
    const dto = plainToInstance(UserToCreateDto, {
      name: 'Eve',
      email: 'eve@example.com',
      roles: ['admin'],
      joined: 'April 5th, 2021',
    });

    expect(dto.joined).toBe('2021-04-05T00:00:00.000Z');
  });

  it('should fail validation if required fields are missing', async () => {
    const dto = plainToInstance(UserToCreateDto, {});
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const fieldsWithErrors = errors.map((e) => e.property);
    expect(fieldsWithErrors).toContain('name');
    expect(fieldsWithErrors).toContain('email');
    expect(fieldsWithErrors).toContain('roles');
    expect(fieldsWithErrors).toContain('joined');
  });

  it('should generate correct OpenSearch bulk upsert payload', () => {
    const dto = plainToInstance(UserToCreateDto, {
      name: 'Frank',
      email: 'frank@example.com',
      roles: ['admin', 'editor'],
      joined: '2021-04-01',
    });

    const bulk = UserToCreateDto.toOpenSearchBulkUpsert(dto);

    expect(bulk[0]).toEqual({
      index: { _index: OPEN_SEARCH_USERS_INDEX, _id: 'frank@example.com' },
    });
    expect(bulk[1]).toMatchObject({
      name: 'Frank',
      email: 'frank@example.com',
      roles: JSON.stringify(['admin', 'editor']),
      joined: '2021-04-01T00:00:00.000Z',
      summary: 'Frank/frank@example.com/admin, editor',
    });
  });
});
