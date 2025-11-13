import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Forbidden Exception (403)
 * 
 * Thrown when the user is authenticated but doesn't have permission to access the resource
 * 
 * @example
 * throw new ForbiddenException('You do not have permission to access this resource');
 */
export class ForbiddenException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
        error: 'Forbidden',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
