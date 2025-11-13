import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Not Found Exception (404)
 * 
 * Thrown when a requested resource is not found
 * 
 * @example
 * throw new NotFoundException('User not found');
 */
export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message,
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
