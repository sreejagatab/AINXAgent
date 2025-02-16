import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';
import { config } from '../config';
import type { 
  SystemMetrics, 
  ServiceHealth,
  ErrorMetrics,
  PerformanceMetrics 
} from '../types/monitoring.types';

export class MonitoringService {
  private static instance: MonitoringService;
  private readonly METRICS_PREFIX = 'metrics:';
  private readonly METRICS_TTL = 86400; // 24 hours

  private constructor() {
    this.initializeMetricsCollection();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public async getSystemHealth(): Promise<ServiceHealth> {
    try {
      const [dbHealth, cacheHealth] = await Promise.all([
        this.checkDatabaseHealth(),
        this.checkCacheHealth(),
      ]);

      const systemLoad = process.cpuUsage();
      const memoryUsage = process.memoryUsage();

      return {
        status: dbHealth && cacheHealth ? 'healthy' : 'degraded',
        timestamp: new Date(),
        services: {
          database: {
            status: dbHealth ? 'up' : 'down',
            latency: await this.measureDatabaseLatency(),
          },
          cache: {
            status: cacheHealth ? 'up' : 'down',
            latency: await this.measureCacheLatency(),
          },
          api: {
            status: 'up',
            version: config.VERSION,
          },
        },
        metrics: {
          cpu: {
            user: systemLoad.user / 1000000,
            system: systemLoad.system / 1000000,
          },
          memory: {
            used: memoryUsage.heapUsed / 1024 / 1024,
            total: memoryUsage.heapTotal / 1024 / 1024,
          },
        },
      };
    } catch (error) {
      logger.error('Failed to get system health:', error);
      throw error;
    }
  }

  public async trackError(error: Error, metadata: Record<string, any>): Promise<void> {
    try {
      await prisma.errorLog.create({
        data: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          metadata: metadata,
        },
      });

      // Increment error counter in Redis
      const key = `${this.METRICS_PREFIX}errors:${error.name}`;
      await redis.incr(key);
      await redis.expire(key, this.METRICS_TTL);
    } catch (err) {
      logger.error('Failed to track error:', err);
    }
  }

  public async trackPerformance(
    operation: string,
    duration: number,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.performanceMetric.create({
        data: {
          operation,
          duration,
          metadata,
        },
      });

      // Update performance metrics in Redis
      const key = `${this.METRICS_PREFIX}performance:${operation}`;
      await redis.zadd(key, duration, Date.now().toString());
      await redis.expire(key, this.METRICS_TTL);
    } catch (error) {
      logger.error('Failed to track performance:', error);
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  private async checkCacheHealth(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      logger.error('Cache health check failed:', error);
      return false;
    }
  }

  private async measureDatabaseLatency(): Promise<number> {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return Date.now() - start;
  }

  private async measureCacheLatency(): Promise<number> {
    const start = Date.now();
    await redis.ping();
    return Date.now() - start;
  }

  private initializeMetricsCollection(): void {
    // Collect metrics every minute
    setInterval(async () => {
      try {
        const metrics = await this.collectSystemMetrics();
        await this.storeMetrics(metrics);
      } catch (error) {
        logger.error('Failed to collect metrics:', error);
      }
    }, 60000);
  }

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      timestamp: new Date(),
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      process: {
        uptime: process.uptime(),
        pid: process.pid,
      },
    };
  }

  private async storeMetrics(metrics: SystemMetrics): Promise<void> {
    const key = `${this.METRICS_PREFIX}${metrics.timestamp.getTime()}`;
    await redis.set(key, JSON.stringify(metrics), 'EX', this.METRICS_TTL);
  }
}

export const monitoringService = MonitoringService.getInstance(); 