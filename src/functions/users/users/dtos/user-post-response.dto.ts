import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserPostResponseDto {
  @ApiPropertyOptional({
    example: 'string',
    description: 'Explanation message',
  })
  @IsString()
  @IsOptional()
  public message?: string;

  @ApiPropertyOptional({
    example: 'string',
    description: 'Error message',
  })
  @IsString()
  @IsOptional()
  public error?: string;

  @ApiProperty({
    example: 'number',
    description: 'http status code',
  })
  @IsNumber()
  public statusCode: string;
}
