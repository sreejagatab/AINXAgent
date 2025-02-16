import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';
import { logger } from '../utils/logger';

export function cache(ttl?: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await cacheService.get(key);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Store original res.json method
      const originalJson = res.json.bind(res);

      // Override res.json method
      res.json = ((data: any) => {
        // Restore original res.json method
        res.json = originalJson;

        // Cache the data
        cacheService.set(key, data, ttl);

        // Send the response
        return originalJson(data);
      }) as any;

      next();
    } catch (error) {
      logger.error('Cache middleware error', { error, url: req.originalUrl });
      next();
    }
  };
}

export function clearCache(pattern: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await cacheService.invalidatePattern(pattern);
      next();
    } catch (error) {
      logger.error('Clear cache middleware error', { error, pattern });
      next();
    }
  };
} 