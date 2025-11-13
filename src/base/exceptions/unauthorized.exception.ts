import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Unauthorized Exception (401)
 * 
 * Thrown when authentication is required but not provided or invalid
 * 
 * @example
 * throw new UnauthorizedException('Invalid credentials');
 */
export class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        error: 'Unauthorized',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
