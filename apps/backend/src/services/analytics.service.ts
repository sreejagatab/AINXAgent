import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';
import { queueService } from './queue.service';
import type { 
  AnalyticsEvent, 
  AnalyticsFilter, 
  AnalyticsMetric,
  TimeRange 
} from '../types/analytics.types';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private readonly CACHE_PREFIX = 'analytics:';
  private readonly CACHE_TTL = 300; // 5 minutes

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Add to processing queue
      await queueService.addJob('analytics', {
        type: 'track-event',
        data: event,
      });

      // Increment real-time counters
      await this.incrementEventCounters(event);
    } catch (error) {
      logger.error('Failed to track event:', error);
      throw error;
    }
  }

  public async getMetrics(
    metric: AnalyticsMetric,
    timeRange: TimeRange,
    filters?: AnalyticsFilter[]
  ): Promise<any> {
    try {
      const cacheKey = this.generateCacheKey(metric, timeRange, filters);
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const result = await this.calculateMetrics(metric, timeRange, filters);
      await redis.set(cacheKey, JSON.stringify(result), 'EX', this.CACHE_TTL);

      return result;
    } catch (error) {
      logger.error('Failed to get metrics:', error);
      throw error;
    }
  }

  private async calculateMetrics(
    metric: AnalyticsMetric,
    timeRange: TimeRange,
    filters?: AnalyticsFilter[]
  ): Promise<any> {
    const { startDate, endDate } = this.getDateRange(timeRange);
    const whereClause = this.buildWhereClause(filters);

    switch (metric) {
      case 'active_users':
        return await this.getActiveUsers(startDate, endDate, whereClause);
      case 'event_counts':
        return await this.getEventCounts(startDate, endDate, whereClause);
      case 'conversion_rate':
        return await this.getConversionRate(startDate, endDate, whereClause);
      // Add more metric calculations as needed
      default:
        throw new Error(`Unsupported metric: ${metric}`);
    }
  }

  private async incrementEventCounters(event: AnalyticsEvent): Promise<void> {
    const pipeline = redis.pipeline();
    const timestamp = new Date();

    // Increment total event count
    pipeline.incr(`${this.CACHE_PREFIX}events:${event.type}:total`);

    // Increment hourly count
    const hourKey = `${this.CACHE_PREFIX}events:${event.type}:${timestamp.getFullYear()}:${timestamp.getMonth() + 1}:${timestamp.getDate()}:${timestamp.getHours()}`;
    pipeline.incr(hourKey);
    pipeline.expire(hourKey, 48 * 3600); // 48 hours

    await pipeline.exec();
  }

  private generateCacheKey(
    metric: AnalyticsMetric,
    timeRange: TimeRange,
    filters?: AnalyticsFilter[]
  ): string {
    const hash = require('crypto')
      .createHash('md5')
      .update(JSON.stringify({ metric, timeRange, filters }))
      .digest('hex');
    return `${this.CACHE_PREFIX}metrics:${hash}`;
  }

  // Helper methods
  private getDateRange(timeRange: TimeRange): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    return { startDate, endDate };
  }

  private buildWhereClause(filters?: AnalyticsFilter[]): any {
    if (!filters?.length) return {};

    return filters.reduce((acc, filter) => ({
      ...acc,
      [filter.field]: filter.value,
    }), {});
  }
}

export const analyticsService = AnalyticsService.getInstance(); 