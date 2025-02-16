import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../lib/redis';
import { config } from '../config';
import { ApiError } from '../utils/errors';
import type { Request, Response } from 'express';

// Global rate limiter
export const globalRateLimiter = rateLimit({
  store: new RedisStore({
    prefix: 'rate-limit:global:',
    // @ts-ignore - Redis client version mismatch
    client: redis,
  }),
  windowMs: config.rateLimit.window, // Default: 15 minutes
  max: config.rateLimit.max, // Default: 100 requests per window
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    throw new ApiError('Rate limit exceeded', 429);
  },
});

// API-specific rate limiter
export const apiRateLimiter = rateLimit({
  store: new RedisStore({
    prefix: 'rate-limit:api:',
    // @ts-ignore - Redis client version mismatch
    client: redis,
  }),
  windowMs: config.rateLimit.api.window, // Default: 1 minute
  max: config.rateLimit.api.max, // Default: 60 requests per window
  message: 'Too many API requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    throw new ApiError('API rate limit exceeded', 429);
  },
});

// AI completion rate limiter
export const aiRateLimiter = rateLimit({
  store: new RedisStore({
    prefix: 'rate-limit:ai:',
    // @ts-ignore - Redis client version mismatch
    client: redis,
  }),
  windowMs: config.rateLimit.ai.window, // Default: 1 minute
  max: config.rateLimit.ai.max, // Default: 10 requests per window
  message: 'Too many AI requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    throw new ApiError('AI rate limit exceeded', 429);
  },
});

// User-specific rate limiter factory
export const createUserRateLimiter = (
  prefix: string,
  windowMs: number,
  max: number
) => {
  return rateLimit({
    store: new RedisStore({
      prefix: `rate-limit:user:${prefix}:`,
      // @ts-ignore - Redis client version mismatch
      client: redis,
    }),
    windowMs,
    max,
    message: 'User rate limit exceeded, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      throw new ApiError('User rate limit exceeded', 429);
    },
    keyGenerator: (req: Request) => {
      return req.user?.id || req.ip;
    },
  });
}; 