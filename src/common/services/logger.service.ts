import { Injectable, Logger } from '@nestjs/common';

/**
 * Structured Logger Service
 * 
 * Provides consistent logging across the application with context tracking,
 * timestamps, and structured data formatting.
 * 
 * Usage:
 * constructor(private logger: LoggerService) {}
 * 
 * this.logger.log('User created', 'UsersService');
 * this.logger.error('Database error', error, 'UsersService');
 * this.logger.warn('Deprecated method used', 'UsersService');
 * this.logger.debug('Debug info', { userId: 123 }, 'UsersService');
 */
@Injectable()
export class LoggerService {
  private logger = new Logger();

  /**
   * Log an informational message
   * 
   * @param message - The message to log
   * @param context - Optional context (usually the service name)
   * @param data - Optional data to include in the log
   * 
   * @example
   * this.logger.log('User created successfully', 'UsersService', { userId: 123 });
   */
  log(message: string, context?: string, data?: any): void {
    const logData = data ? ` | ${JSON.stringify(data)}` : '';
    this.logger.log(`${message}${logData}`, context || 'App');
  }

  /**
   * Log an error message with stack trace
   * 
   * @param message - The error message
   * @param error - The error object or message
   * @param context - Optional context (usually the service name)
   * 
   * @example
   * this.logger.error('Failed to create user', error, 'UsersService');
   */
  error(message: string, error?: any, context?: string): void {
    const errorMessage = error?.message || error || 'Unknown error';
    const stack = error?.stack || '';
    this.logger.error(
      `${message} | ${errorMessage}`,
      stack,
      context || 'App',
    );
  }

  /**
   * Log a warning message
   * 
   * @param message - The warning message
   * @param context - Optional context (usually the service name)
   * @param data - Optional data to include in the log
   * 
   * @example
   * this.logger.warn('Deprecated method used', 'UsersService');
   */
  warn(message: string, context?: string, data?: any): void {
    const logData = data ? ` | ${JSON.stringify(data)}` : '';
    this.logger.warn(`${message}${logData}`, context || 'App');
  }

  /**
   * Log a debug message (only in development)
   * 
   * @param message - The debug message
   * @param data - Optional data to include in the log
   * @param context - Optional context (usually the service name)
   * 
   * @example
   * this.logger.debug('Processing user data', { userId: 123 }, 'UsersService');
   */
  debug(message: string, data?: any, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      const logData = data ? ` | ${JSON.stringify(data)}` : '';
      this.logger.debug(`${message}${logData}`, context || 'App');
    }
  }

  /**
   * Log verbose message (only in development)
   * 
   * @param message - The verbose message
   * @param context - Optional context (usually the service name)
   * @param data - Optional data to include in the log
   * 
   * @example
   * this.logger.verbose('Detailed operation info', 'UsersService', { details: '...' });
   */
  verbose(message: string, context?: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const logData = data ? ` | ${JSON.stringify(data)}` : '';
      this.logger.verbose(`${message}${logData}`, context || 'App');
    }
  }

  /**
   * Log performance metrics
   * 
   * @param operation - The operation name
   * @param duration - Duration in milliseconds
   * @param context - Optional context (usually the service name)
   * 
   * @example
   * this.logger.performance('Database query', 150, 'UsersService');
   */
  performance(operation: string, duration: number, context?: string): void {
    const message = `${operation} completed in ${duration}ms`;
    if (duration > 1000) {
      this.warn(message, context || 'App', { duration });
    } else {
      this.debug(message, { duration }, context || 'App');
    }
  }
}
