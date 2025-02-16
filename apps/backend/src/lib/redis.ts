import { createClient } from 'redis';
import { logger } from '../utils/logger';
import { config } from '../config';

class RedisClient {
  private static instance: RedisClient;
  private client: ReturnType<typeof createClient>;

  private constructor() {
    this.client = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis max retries reached. Giving up...');
            return new Error('Redis max retries reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis Client Reconnecting');
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
    await this.client.connect();
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  public async set(
    key: string,
    value: string,
    options?: { ttl?: number }
  ): Promise<void> {
    try {
      if (options?.ttl) {
        await this.client.set(key, value, { EX: options.ttl });
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis set error:', error);
      throw error;
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis get error:', error);
      throw error;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis del error:', error);
      throw error;
    }
  }

  public async setHash(
    key: string,
    field: string,
    value: string
  ): Promise<void> {
    try {
      await this.client.hSet(key, field, value);
    } catch (error) {
      logger.error('Redis setHash error:', error);
      throw error;
    }
  }

  public async getHash(
    key: string,
    field: string
  ): Promise<string | null> {
    try {
      return await this.client.hGet(key, field);
    } catch (error) {
      logger.error('Redis getHash error:', error);
      throw error;
    }
  }
}

export const redis = RedisClient.getInstance(); 