import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { RedisService } from '../../services/redis.service';
import { RATE_LIMITS } from '@enhanced-ai-agent/shared';
import { Request, Response } from 'express';

const redis = RedisService.getInstance();

export const rateLimiter = (options = RATE_LIMITS.DEFAULT) =>
  rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.client.sendCommand(args),
    }),
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      // Use API key if present, otherwise use IP
      return req.headers['x-api-key'] || req.ip;
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later.',
        retryAfter: res.getHeader('Retry-After'),
      });
    },
  });

export const apiRateLimiter = rateLimiter(RATE_LIMITS.API);
export const authRateLimiter = rateLimiter(RATE_LIMITS.AUTH); 