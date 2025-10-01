import { FileValidator } from '@nestjs/common';

export class UsersFileValidator extends FileValidator {
  private readonly allowedTypes: string[];
  private readonly errorMessages: string[] = [];

  constructor(allowedTypes: string[]) {
    super({ errorHttpStatusCode: 422 });
    this.allowedTypes = allowedTypes;
  }

  public isValid(file?: Express.Multer.File) {
    if (!file) this.errorMessages.push('File must be provided');

    const allowedBites = 1024 * 1024 * 5;
    if (file && file.size > allowedBites)
      this.errorMessages.push(`File is too large (${file.size}). Allowed ${allowedBites}`);

    if (file && !this.allowedTypes.includes(file.mimetype))
      this.errorMessages.push(`Invalid file type ${file.mimetype}, expected 'application/json' `);

    return this.errorMessages.length === 0;
  }

  public buildErrorMessage(): string {
    const message = this.errorMessages.join('. ');
    return message;
  }
}
