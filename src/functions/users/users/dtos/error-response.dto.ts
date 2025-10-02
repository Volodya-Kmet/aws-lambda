import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
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
