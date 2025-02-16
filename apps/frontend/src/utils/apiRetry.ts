import { logger } from './logger';
import { analyticsService } from '../services/analytics.service';

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableStatuses: number[];
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

export class ApiRetry {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  public async execute<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;
    let delay = this.config.initialDelay;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) {
          this.logRetrySuccess(context, attempt);
        }
        return result;
      } catch (error: any) {
        lastError = error;

        if (!this.isRetryable(error)) {
          throw error;
        }

        if (attempt === this.config.maxRetries) {
          this.logRetryFailure(context, attempt, error);
          throw error;
        }

        await this.wait(delay);
        delay = Math.min(
          delay * this.config.backoffFactor,
          this.config.maxDelay
        );
      }
    }

    throw lastError!;
  }

  private isRetryable(error: any): boolean {
    if (!error.status) return true;
    return this.config.retryableStatuses.includes(error.status);
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logRetrySuccess(context: string, attempt: number): void {
    logger.info('API retry successful', {
      context,
      attempt,
    });

    analyticsService.trackEvent('api_retry_success', {
      context,
      attempts: attempt,
    });
  }

  private logRetryFailure(context: string, attempt: number, error: Error): void {
    logger.error('API retry failed', {
      context,
      attempts: attempt,
      error,
    });

    analyticsService.trackEvent('api_retry_failure', {
      context,
      attempts: attempt,
      error: error.message,
    });
  }
}

export const apiRetry = new ApiRetry(); 