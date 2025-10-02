import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuccessResponseDto {
  @ApiPropertyOptional({
    example: 'string',
    description: 'Explanation message',
  })
  @IsString()
  @IsOptional()
  public message?: string;

  @ApiPropertyOptional({
    example: 'string',
    description: 'Response data',
  })
  @IsString()
  @IsOptional()
  public data?: Record<string, any>;

  @ApiProperty({
    example: 'number',
    description: 'http status code',
  })
  @IsNumber()
  public statusCode: string;
}
