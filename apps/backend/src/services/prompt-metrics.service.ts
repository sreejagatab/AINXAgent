import { PrismaClient } from '@prisma/client';
import { PromptExecutionResult } from '@enhanced-ai-agent/shared';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';
import { RedisService } from './redis.service';

export class PromptMetricsService {
  private static instance: PromptMetricsService;
  private prisma: PrismaClient;
  private redis: RedisService;
  private monitor: PerformanceMonitor;

  private constructor() {
    this.prisma = new PrismaClient();
    this.redis = RedisService.getInstance();
    this.monitor = PerformanceMonitor.getInstance('PromptMetricsService');
  }

  static getInstance(): PromptMetricsService {
    if (!PromptMetricsService.instance) {
      PromptMetricsService.instance = new PromptMetricsService();
    }
    return PromptMetricsService.instance;
  }

  async recordExecution(result: PromptExecutionResult): Promise<void> {
    const startTime = Date.now();
    try {
      await this.prisma.promptExecution.create({
        data: {
          promptId: result.promptId,
          model: result.model,
          duration: result.duration,
          tokenUsage: result.tokenUsage,
          success: result.success,
          metadata: result.metadata,
        },
      });

      await this.updateAggregateMetrics(result);
      this.monitor.recordMetric('record_execution', Date.now() - startTime);
    } catch (error) {
      this.monitor.recordError('record_execution', error as Error);
    }
  }

  async getPromptMetrics(promptId: string): Promise<any> {
    const startTime = Date.now();
    try {
      const metrics = await this.prisma.promptExecution.aggregate({
        where: { promptId },
        _avg: {
          duration: true,
        },
        _sum: {
          'tokenUsage.total': true,
        },
        _count: true,
      });

      this.monitor.recordMetric('get_metrics', Date.now() - startTime);
      return metrics;
    } catch (error) {
      this.monitor.recordError('get_metrics', error as Error);
      throw error;
    }
  }

  private async updateAggregateMetrics(result: PromptExecutionResult): Promise<void> {
    const key = `metrics:${result.promptId}`;
    const pipe = this.redis.pipeline();

    pipe.hincrby(key, 'total_executions', 1);
    pipe.hincrby(key, 'total_tokens', result.tokenUsage.total);
    pipe.hincrbyfloat(key, 'total_duration', result.duration);
    
    if (result.success) {
      pipe.hincrby(key, 'successful_executions', 1);
    }

    await pipe.exec();
  }
} 