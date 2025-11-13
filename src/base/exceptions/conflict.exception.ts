import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Conflict Exception (409)
 * 
 * Thrown when there's a conflict with existing data (e.g., duplicate entry)
 * 
 * @example
 * throw new ConflictException('Email already exists');
 */
export class ConflictException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'Conflict',
      },
      HttpStatus.CONFLICT,
    );
  }
}
