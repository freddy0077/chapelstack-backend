import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Bad Request Exception (400)
 * 
 * Thrown when the request contains invalid data or parameters
 * 
 * @example
 * throw new BadRequestException('Invalid email format');
 */
export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
