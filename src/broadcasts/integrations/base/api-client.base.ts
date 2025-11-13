import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { Logger } from '@nestjs/common';

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
  exponentialBackoff: boolean;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  enabled: boolean;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retry?: Partial<RetryConfig>;
  circuitBreaker?: Partial<CircuitBreakerConfig>;
}

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

/**
 * Base API Client with retry logic, circuit breaker, and error handling
 */
export class ApiClientBase {
  protected logger: Logger;
  protected readonly client: AxiosInstance;
  
  // Retry configuration
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
    exponentialBackoff: true,
  };

  // Circuit breaker state
  private circuitState: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly circuitBreakerConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    enabled: true,
  };

  // Rate limiting
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue: boolean = false;
  private lastRequestTime: number = 0;
  private readonly minRequestInterval: number = 100; // ms between requests

  constructor(
    protected readonly serviceName: string,
    config: ApiClientConfig,
  ) {
    this.logger = new Logger(`${serviceName}ApiClient`);

    // Merge configurations
    if (config.retry) {
      this.retryConfig = { ...this.retryConfig, ...config.retry };
    }
    if (config.circuitBreaker) {
      this.circuitBreakerConfig = {
        ...this.circuitBreakerConfig,
        ...config.circuitBreaker,
      };
    }

    // Create axios instance
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      },
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(`Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logError(error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Make HTTP request with retry logic and circuit breaker
   */
  protected async request<T>(
    config: AxiosRequestConfig,
    retryCount: number = 0,
  ): Promise<T> {
    // Check circuit breaker
    if (this.circuitBreakerConfig.enabled) {
      this.checkCircuitBreaker();
    }

    try {
      // Rate limiting
      await this.rateLimit();

      // Make request
      const response = await this.client.request<T>(config);

      // Reset circuit breaker on success
      this.onSuccess();

      return response.data;
    } catch (error) {
      // Handle error
      return this.handleError(error as AxiosError, config, retryCount);
    }
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleError<T>(
    error: AxiosError,
    config: AxiosRequestConfig,
    retryCount: number,
  ): Promise<T> {
    const status = error.response?.status;

    // Record failure for circuit breaker
    this.onFailure();

    // Check if error is retryable
    const isRetryable =
      status && this.retryConfig.retryableStatuses.includes(status);

    // Check if we should retry
    if (isRetryable && retryCount < this.retryConfig.maxRetries) {
      const delay = this.calculateRetryDelay(retryCount);

      this.logger.warn(
        `Request failed with status ${status}. Retrying in ${delay}ms (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`,
      );

      // Wait before retry
      await this.sleep(delay);

      // Retry request
      return this.request<T>(config, retryCount + 1);
    }

    // Max retries exceeded or non-retryable error
    this.logger.error(
      `Request failed after ${retryCount} retries: ${error.message}`,
    );
    throw error;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number): number {
    if (this.retryConfig.exponentialBackoff) {
      return this.retryConfig.retryDelay * Math.pow(2, retryCount);
    }
    return this.retryConfig.retryDelay;
  }

  /**
   * Check circuit breaker state
   */
  private checkCircuitBreaker(): void {
    const now = Date.now();

    switch (this.circuitState) {
      case CircuitState.OPEN:
        // Check if reset timeout has passed
        if (now - this.lastFailureTime >= this.circuitBreakerConfig.resetTimeout) {
          this.logger.log('Circuit breaker: OPEN -> HALF_OPEN');
          this.circuitState = CircuitState.HALF_OPEN;
          this.failureCount = 0;
        } else {
          throw new Error(
            `Circuit breaker is OPEN. Service unavailable. Retry after ${Math.ceil((this.circuitBreakerConfig.resetTimeout - (now - this.lastFailureTime)) / 1000)}s`,
          );
        }
        break;

      case CircuitState.HALF_OPEN:
        // Allow one request to test if service is back
        break;

      case CircuitState.CLOSED:
        // Normal operation
        break;
    }
  }

  /**
   * Record successful request
   */
  private onSuccess(): void {
    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.logger.log('Circuit breaker: HALF_OPEN -> CLOSED');
      this.circuitState = CircuitState.CLOSED;
      this.failureCount = 0;
    }
  }

  /**
   * Record failed request
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (
      this.circuitState === CircuitState.CLOSED &&
      this.failureCount >= this.circuitBreakerConfig.failureThreshold
    ) {
      this.logger.error(
        `Circuit breaker: CLOSED -> OPEN (${this.failureCount} failures)`,
      );
      this.circuitState = CircuitState.OPEN;
    } else if (this.circuitState === CircuitState.HALF_OPEN) {
      this.logger.warn('Circuit breaker: HALF_OPEN -> OPEN (test failed)');
      this.circuitState = CircuitState.OPEN;
    }
  }

  /**
   * Rate limiting to prevent API throttling
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      await this.sleep(delay);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log error details
   */
  private logError(error: AxiosError): void {
    if (error.response) {
      // Server responded with error status
      this.logger.error(
        `API Error: ${error.response.status} ${error.response.statusText}`,
        {
          url: error.config?.url,
          method: error.config?.method,
          data: error.response.data,
        },
      );
    } else if (error.request) {
      // Request made but no response
      this.logger.error('No response received from API', {
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      // Error setting up request
      this.logger.error('Request setup error:', error.message);
    }
  }

  /**
   * Get circuit breaker status
   */
  public getCircuitBreakerStatus(): {
    state: CircuitState;
    failureCount: number;
    lastFailureTime: number;
  } {
    return {
      state: this.circuitState,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Reset circuit breaker manually
   */
  public resetCircuitBreaker(): void {
    this.logger.log('Circuit breaker manually reset');
    this.circuitState = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  /**
   * Check if service is healthy
   */
  public isHealthy(): boolean {
    return this.circuitState !== CircuitState.OPEN;
  }
}
