import type { Socket } from 'socket.io';
import { rateLimiter } from '../middleware/rate-limit';
import { logger } from '../utils/logger';
import { redis } from '../lib/redis';
import { config } from '../config';

export class WebSocketMiddleware {
  private static readonly RATE_LIMIT_PREFIX = 'ws:ratelimit:';
  private static readonly MAX_EVENTS_PER_MINUTE = 100;

  public static async rateLimiter(socket: Socket, next: (err?: Error) => void) {
    try {
      const userId = socket.data.user.id;
      const key = `${this.RATE_LIMIT_PREFIX}${userId}`;
      
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, 60); // 1 minute
      }

      if (count > this.MAX_EVENTS_PER_MINUTE) {
        throw new Error('Rate limit exceeded');
      }

      next();
    } catch (error) {
      logger.warn('WebSocket rate limit exceeded:', {
        userId: socket.data.user.id,
        socketId: socket.id,
      });
      next(error as Error);
    }
  }

  public static async errorHandler(socket: Socket, next: (err?: Error) => void) {
    try {
      socket.on('error', (error: Error) => {
        logger.error('WebSocket error:', {
          error,
          userId: socket.data.user.id,
          socketId: socket.id,
        });

        socket.emit('error', {
          message: config.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message,
          code: 'INTERNAL_ERROR',
        });
      });

      next();
    } catch (error) {
      next(error as Error);
    }
  }

  public static async activityTracker(socket: Socket, next: (err?: Error) => void) {
    try {
      const userId = socket.data.user.id;
      const key = `user:${userId}:lastActive`;
      
      // Update last active timestamp
      await redis.set(key, new Date().toISOString(), 'EX', 3600); // 1 hour

      socket.on('disconnect', async () => {
        await redis.del(key);
      });

      next();
    } catch (error) {
      next(error as Error);
    }
  }
} 