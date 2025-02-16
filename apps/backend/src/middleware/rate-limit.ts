import rateLimit from 'express-rate-limit';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import type { RateLimitOptions } from '../types/middleware.types';

const RedisStore = require('rate-limit-redis');

export function rateLimiter(options: RateLimitOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later',
    keyGenerator = (req) => {
      return req.user?.id 
        ? `rate-limit:user:${req.user.id}` 
        : `rate-limit:ip:${req.ip}`;
    },
  } = options;

  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rate-limit:',
      // Expire keys after window
      expiry: windowMs / 1000,
    }),
    windowMs,
    max,
    message,
    keyGenerator,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded:', {
        ip: req.ip,
        userId: req.user?.id,
        path: req.path,
      });

      throw ApiError.tooManyRequests(message);
    },
    skip: (req) => {
      // Skip rate limiting for certain conditions
      return req.ip === '127.0.0.1' || // Skip localhost
             req.user?.role === 'ADMIN'; // Skip admins
    },
    statusCode: 429,
    headers: true, // Send rate limit headers
    draft_polli_ratelimit_headers: true, // Use standardized headers
  });
}

// Specific rate limiters
export const apiLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many API requests, please try again later',
});

export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts, please try again later',
});

export const uploadLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads
  message: 'Upload limit exceeded, please try again later',
}); 