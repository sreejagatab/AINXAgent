import { cache } from '../lib/redis';
import { logger } from '../utils/logger';
import type { DocCacheKeys } from '../types/documentation.types';

class CacheService {
  private static instance: CacheService;
  private readonly DEFAULT_TTL = 300; // 5 minutes

  private readonly keys: DocCacheKeys = {
    page: (id: string) => `doc:page:${id}`,
    allPages: 'doc:pages:all',
    sections: (tag: string) => `doc:sections:${tag}`,
    search: (params) => `doc:search:${JSON.stringify(params)}`,
  };

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const data = await cache.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get failed', { error, key });
      return null;
    }
  }

  public async set(key: string, value: any, ttl = this.DEFAULT_TTL): Promise<void> {
    try {
      await cache.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      logger.error('Cache set failed', { error, key });
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await cache.del(key);
    } catch (error) {
      logger.error('Cache delete failed', { error, key });
    }
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await cache.keys(pattern);
      if (keys.length > 0) {
        await cache.del(...keys);
      }
    } catch (error) {
      logger.error('Cache pattern invalidation failed', { error, pattern });
    }
  }

  public getKeys(): DocCacheKeys {
    return this.keys;
  }

  public async clearAll(): Promise<void> {
    try {
      await cache.flushdb();
    } catch (error) {
      logger.error('Cache clear all failed', { error });
    }
  }
}

export const cacheService = CacheService.getInstance(); 