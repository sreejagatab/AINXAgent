import { Middleware } from '@reduxjs/toolkit';
import { performanceService } from '../services/performance.service';
import { logger } from '../utils/logger';

interface CacheEntry {
  data: any;
  timestamp: number;
}

class ApiCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const apiCache = new ApiCache();

export const apiMiddleware: Middleware = () => (next) => (action) => {
  if (!action.type.endsWith('/pending')) {
    return next(action);
  }

  const { endpoint, method, body } = action.meta?.arg || {};
  if (!endpoint || method !== 'GET') {
    return next(action);
  }

  // Check cache for GET requests
  const cacheKey = `${method}:${endpoint}`;
  const cachedData = apiCache.get(cacheKey);

  if (cachedData) {
    logger.debug('Cache hit', { endpoint });
    return Promise.resolve(cachedData);
  }

  // Measure API call performance
  return performanceService.measureAsync(`api_call_${endpoint}`, async () => {
    const result = await next(action);

    // Cache successful GET responses
    if (result.type.endsWith('/fulfilled')) {
      apiCache.set(cacheKey, result);
    }

    return result;
  });
}; 