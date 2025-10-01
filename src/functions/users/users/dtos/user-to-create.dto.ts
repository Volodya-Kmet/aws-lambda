import { UserRolesEnum } from '../../constants/user-roles.enum';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';
import { DateTime } from 'luxon';
import { IBulkInput } from '../../../../shared/open-search/types/bulkInput.interface';
import { OPEN_SEARCH_USERS_INDEX } from '../../constants/open-serach-index.constant';

export class UserToCreateDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  public name: string;

  @ApiProperty({
    required: true,
  })
  @IsEmail()
  @Transform(({ value }) => value.trim().replace(/\(at\)/g, '@'))
  public email: string;

  @ApiProperty({
    required: true,
    isArray: true,
    enum: UserRolesEnum,
  })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map((role) => String(role)).filter(Boolean);
    if (typeof value === 'string')
      return value
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
    return [];
  })
  @IsString({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  public roles: Array<UserRolesEnum>;

  @ApiProperty({
    required: true,
    type: 'string',
  })
  @Transform(({ value }) => {
    if (!value) return null;
    let date: string | null = null;

    const cleaned = value.replace(/(\d+)(st|nd|rd|th)/, '$1');
    const validDateFormats = ['yyyy-MM-dd', 'MMMM d, yyyy'];

    validDateFormats.forEach((dateFormat) => {
      const formatedDate = DateTime.fromFormat(cleaned, dateFormat, { zone: 'utc' });
      if (!formatedDate.isValid) return;

      date = formatedDate.startOf('day').toISO({ suppressMilliseconds: false, includeOffset: true });
    });

    return date;
  })
  @IsDateString()
  public joined: string;

  public static toOpenSearchBulkUpsert(user: UserToCreateDto): Array<IBulkInput | Record<string, any>> {
    return [
      { index: { _index: OPEN_SEARCH_USERS_INDEX, _id: user.email } },
      {
        summary: `${user.name}/${user.email}/${user.roles.join(', ')}`,
        name: user.name,
        roles: JSON.stringify(user.roles),
        joined: user.joined,
        email: user.email,
      },
    ];
  }

  public static toDto(user: UserToCreateDto): UserToCreateDto {
    //need to remove unnecessary fields
    return plainToInstance(UserToCreateDto, {
      name: user.name,
      roles: user.roles,
      joined: user.joined,
      email: user.email,
    });
  }
}
