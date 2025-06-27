import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path:
        host.getType() === 'http'
          ? httpAdapter.getRequestUrl(ctx.getRequest())
          : 'N/A (GraphQL Error)',
      message: ((): string => {
        if (!(exception instanceof HttpException)) {
          return 'Internal server error';
        }

        const errorResponse = exception.getResponse();

        if (typeof errorResponse === 'string') {
          return errorResponse;
        }

        if (errorResponse && typeof errorResponse === 'object') {
          // Check for a 'message' property in the error object
          if ('message' in errorResponse) {
            const messageValue = (
              errorResponse as { message?: string | string[] }
            ).message;
            if (Array.isArray(messageValue)) {
              return messageValue.join(', ');
            }
            if (typeof messageValue === 'string') {
              return messageValue;
            }
          }
        }

        // Fallback to the exception's own message property if it's a string
        if (
          typeof exception.message === 'string' &&
          exception.message.trim() !== ''
        ) {
          return exception.message;
        }

        return 'Internal server error'; // Ultimate fallback
      })(),
    };

    if (host.getType() === 'http') {
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    } else if ((host.getType() as string) === 'graphql') {
      // For GraphQL, the error should propagate to be handled by the GraphQL engine.
      // We've already formatted responseBody, but the standard GraphQL error handling
      // might take precedence or reformat it. This filter's primary job for GQL errors
      // becomes ensuring the status code and a consistent message structure if possible,
      // assuming the error bubbles up correctly to the GQL layer.
      // If the original exception is not an instance of HttpException or GraphQLError,
      // it might be beneficial to wrap it here, but that can get complex.
      // For now, not calling reply() prevents the crash.
      // Consider if a GraphQL-specific error interceptor or a more sophisticated
      // global filter that handles different contexts explicitly is needed long-term.
      console.error(
        '[AllExceptionsFilter] GraphQL error context. Response body prepared but not sent via httpAdapter.reply:',
        JSON.stringify(responseBody),
      );
      // Re-throwing the original exception or a new HttpException might be an option
      // if NestJS's GraphQL module doesn't pick it up correctly otherwise.
      // e.g., if (!(exception instanceof HttpException) && !(exception instanceof GraphQLError)) {
      //   throw new HttpException(responseBody, httpStatus);
      // }
    }
  }
}
