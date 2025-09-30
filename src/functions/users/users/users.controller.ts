import { Controller, Get, HttpStatus, ParseFilePipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { OpenSearchService } from '../../../shared/open-search/openseearch.service';
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserPostResponseDto } from './dtos/user-post-response.dto';
import { memoryStorage } from 'multer';
import { UsersFileValidator } from './validators/user-upload-file.validator';
import { UsersService } from './users.service';
import { plainToInstance } from 'class-transformer';
import { PinoLogger } from 'nestjs-pino';

@Controller('users')
export class UsersController {
  public constructor(
    private readonly osService: OpenSearchService,
    private readonly usersService: UsersService,
    private readonly logger: PinoLogger,
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
    status: 202,
    description: 'Success',
    type: UserPostResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Invalid file',
    type: UserPostResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file data',
    type: UserPostResponseDto,
  })
  // @TODO files should be stored to S3
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  public uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new UsersFileValidator(['application/json'])],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
  ): UserPostResponseDto {
    void this.usersService.processUserFile(file).catch((error) => {
      this.logger.error(
        {
          error: {
            message: error.message,
            stack: error.stack,
          },
        },
        'failed to process file',
      );
    });

    return plainToInstance(UserPostResponseDto, {
      message: 'file processing. Result need to check in the logs',
      statusCode: 202,
    });
  }

  @Get('/search')
  async searchUsers(@Query('q') query: string) {
    return this.osService.search('users', query);
  }
}
