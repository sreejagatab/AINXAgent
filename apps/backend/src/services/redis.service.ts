import Redis from 'ioredis';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';

export class RedisService {
  private static instance: RedisService;
  private client: Redis;
  private monitor: PerformanceMonitor;

  private constructor() {
    this.client = new Redis(process.env.REDIS_URL!, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.monitor = PerformanceMonitor.getInstance('RedisService');
    this.setupEventHandlers();
  }

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async get(key: string): Promise<string | null> {
    const startTime = Date.now();
    try {
      const value = await this.client.get(key);
      this.monitor.recordMetric('redis_get', Date.now() - startTime);
      return value;
    } catch (error) {
      this.monitor.recordError('redis_get', error as Error);
      throw error;
    }
  }

  async set(
    key: string,
    value: string,
    expirySeconds?: number
  ): Promise<void> {
    const startTime = Date.now();
    try {
      if (expirySeconds) {
        await this.client.setex(key, expirySeconds, value);
      } else {
        await this.client.set(key, value);
      }
      this.monitor.recordMetric('redis_set', Date.now() - startTime);
    } catch (error) {
      this.monitor.recordError('redis_set', error as Error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    const startTime = Date.now();
    try {
      await this.client.del(key);
      this.monitor.recordMetric('redis_del', Date.now() - startTime);
    } catch (error) {
      this.monitor.recordError('redis_del', error as Error);
      throw error;
    }
  }

  async flush(): Promise<void> {
    await this.client.flushall();
  }

  private setupEventHandlers(): void {
    this.client.on('error', (error) => {
      console.error('Redis Error:', error);
      this.monitor.recordError('redis_connection', error);
    });

    this.client.on('connect', () => {
      console.log('Redis connected');
    });

    this.client.on('ready', () => {
      console.log('Redis ready');
    });
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
} 