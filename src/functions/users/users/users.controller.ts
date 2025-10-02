import { Controller, Get, HttpStatus, ParseFilePipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { OpenSearchService } from '../../../shared/open-search/open-search.service';
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuccessResponseDto } from './dtos/success-response.dto';
import { memoryStorage } from 'multer';
import { UsersFileValidator } from './validators/user-upload-file.validator';
import { UsersService } from './users.service';
import { plainToInstance } from 'class-transformer';
import { Logger } from '@nestjs/common';
import { ErrorResponseDto } from './dtos/error-response.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  public constructor(
    private readonly osService: OpenSearchService,
    private readonly usersService: UsersService,
  ) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Upload json file. Max size of file. 5Mb',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Invalid file',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file data',
    type: ErrorResponseDto,
  })
  // @TODO files should be stored to S3 and respond with 202. than process the file
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  public async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new UsersFileValidator(['application/json'])],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
  ): Promise<SuccessResponseDto> {
    const result = await this.usersService.processUserFile(file);

    return plainToInstance(SuccessResponseDto, {
      message: 'file processing. Result need to check in the logs',
      statusCode: 200,
      data: result,
    });
  }

  @Get('/search')
  async searchUsers(@Query('q') query: string) {
    return this.osService.search('users', query);
  }
}
