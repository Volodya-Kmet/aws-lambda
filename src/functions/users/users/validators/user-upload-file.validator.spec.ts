import { UsersFileValidator } from './user-upload-file.validator';

describe('UsersFileValidator', () => {
  const allowedTypes = ['application/json'];

  it('should be invalid if no file is provided', () => {
    const validator = new UsersFileValidator(allowedTypes);

    const result = validator.isValid(undefined);
    expect(result).toBe(false);
    expect(validator.buildErrorMessage()).toContain('File must be provided');
  });

  it('should be invalid if file size exceeds limit', () => {
    const validator = new UsersFileValidator(allowedTypes);

    const file = {
      size: 6 * 1024 * 1024,
      mimetype: 'application/json',
    } as Express.Multer.File;

    const result = validator.isValid(file);
    expect(result).toBe(false);
    expect(validator.buildErrorMessage()).toMatch('File is too large');
  });

  it('should be invalid if file type is not allowed', () => {
    const validator = new UsersFileValidator(allowedTypes);

    const file = {
      size: 1024,
      mimetype: 'text/plain',
    } as Express.Multer.File;

    const result = validator.isValid(file);
    expect(result).toBe(false);
    expect(validator.buildErrorMessage()).toMatch('Invalid file type');
  });

  it('should be valid for correct file', () => {
    const validator = new UsersFileValidator(allowedTypes);

    const file = {
      size: 1024,
      mimetype: 'application/json',
    } as Express.Multer.File;

    const result = validator.isValid(file);
    expect(result).toBe(true);
    expect(validator.buildErrorMessage()).toBe('');
  });

  it('should accumulate multiple error messages', () => {
    const validator = new UsersFileValidator(allowedTypes);

    const file = {
      size: 6 * 1024 * 1024,
      mimetype: 'text/plain',
    } as Express.Multer.File;

    const result = validator.isValid(file);
    expect(result).toBe(false);

    const msg = validator.buildErrorMessage();
    expect(msg).toContain('File is too large');
    expect(msg).toContain('Invalid file type');
  });
});
