import { createClient } from 'redis';
import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

class RedisService {
  private static instance: RedisService;
  private _redis: Redis;

  private constructor() {
    this._redis = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.setupEventHandlers();
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private setupEventHandlers() {
    this._redis.on('connect', () => {
      logger.info('Connected to Redis');
    });

    this._redis.on('error', (error) => {
      logger.error('Redis error:', error);
    });

    this._redis.on('close', () => {
      logger.warn('Redis connection closed');
    });

    this._redis.on('reconnecting', () => {
      logger.info('Reconnecting to Redis');
    });
  }

  public get redis(): Redis {
    return this._redis;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this._redis.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  public async set(
    key: string,
    value: string,
    mode: string = 'EX',
    duration: number = 3600
  ): Promise<'OK' | null> {
    try {
      return await this._redis.set(key, value, mode, duration);
    } catch (error) {
      logger.error('Redis set failed:', error);
      throw error;
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this._redis.get(key);
    } catch (error) {
      logger.error('Redis get failed:', error);
      throw error;
    }
  }

  public async del(key: string | string[]): Promise<number> {
    try {
      return await this._redis.del(Array.isArray(key) ? key : [key]);
    } catch (error) {
      logger.error('Redis del failed:', error);
      throw error;
    }
  }

  public async quit(): Promise<void> {
    try {
      await this._redis.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Redis quit failed:', error);
      throw error;
    }
  }
}

export const redisService = RedisService.getInstance();
export const redis = redisService.redis; 