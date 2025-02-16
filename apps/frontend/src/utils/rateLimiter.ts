import { logger } from './logger';

interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number;
  retryAfter?: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      maxRequests: config.maxRequests || 50,
      timeWindow: config.timeWindow || 1000, // 1 second
      retryAfter: config.retryAfter || 1000, // 1 second
    };
  }

  public checkLimit(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Remove timestamps outside the time window
    const validTimestamps = timestamps.filter(
      timestamp => now - timestamp < this.config.timeWindow
    );

    if (validTimestamps.length >= this.config.maxRequests) {
      logger.warn('Rate limit exceeded', {
        key,
        requests: validTimestamps.length,
        timeWindow: this.config.timeWindow,
      });
      return false;
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  public async waitForReset(key: string): Promise<void> {
    const timestamps = this.requests.get(key) || [];
    if (timestamps.length === 0) return;

    const oldestTimestamp = timestamps[0];
    const now = Date.now();
    const timeToWait = Math.max(
      0,
      this.config.timeWindow - (now - oldestTimestamp)
    );

    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
  }

  public reset(key: string): void {
    this.requests.delete(key);
  }

  public resetAll(): void {
    this.requests.clear();
  }
}

export const apiRateLimiter = new RateLimiter({
  maxRequests: 50,
  timeWindow: 1000,
  retryAfter: 1000,
}); 