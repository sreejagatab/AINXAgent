import { RedisService } from './redis.service';
import { PromptExecutionResult } from '@enhanced-ai-agent/shared';
import { CACHE_KEYS } from '@enhanced-ai-agent/shared';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';

export class PromptCacheService {
  private static instance: PromptCacheService;
  private redis: RedisService;
  private monitor: PerformanceMonitor;
  private readonly TTL = 3600; // 1 hour

  private constructor() {
    this.redis = RedisService.getInstance();
    this.monitor = PerformanceMonitor.getInstance('PromptCacheService');
  }

  static getInstance(): PromptCacheService {
    if (!PromptCacheService.instance) {
      PromptCacheService.instance = new PromptCacheService();
    }
    return PromptCacheService.instance;
  }

  async getCachedResult(
    promptId: string,
    input: string
  ): Promise<PromptExecutionResult | null> {
    const startTime = Date.now();
    try {
      const cacheKey = this.generateCacheKey(promptId, input);
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        this.monitor.recordMetric('cache_hit', Date.now() - startTime);
        return JSON.parse(cached);
      }

      this.monitor.recordMetric('cache_miss', Date.now() - startTime);
      return null;
    } catch (error) {
      this.monitor.recordError('cache_get', error as Error);
      return null;
    }
  }

  async cacheResult(
    promptId: string,
    input: string,
    result: PromptExecutionResult
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const cacheKey = this.generateCacheKey(promptId, input);
      await this.redis.set(
        cacheKey,
        JSON.stringify(result),
        this.TTL
      );
      this.monitor.recordMetric('cache_set', Date.now() - startTime);
    } catch (error) {
      this.monitor.recordError('cache_set', error as Error);
    }
  }

  async invalidateCache(promptId: string): Promise<void> {
    const startTime = Date.now();
    try {
      const pattern = `${CACHE_KEYS.PROMPT_DATA}${promptId}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      
      this.monitor.recordMetric('cache_invalidate', Date.now() - startTime);
    } catch (error) {
      this.monitor.recordError('cache_invalidate', error as Error);
    }
  }

  private generateCacheKey(promptId: string, input: string): string {
    return `${CACHE_KEYS.PROMPT_DATA}${promptId}:${this.hashInput(input)}`;
  }

  private hashInput(input: string): string {
    return Buffer.from(input).toString('base64');
  }
} 