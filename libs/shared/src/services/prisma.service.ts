import { PrismaClient } from '@prisma/client';
import { PerformanceMonitor } from './performance.monitor';

export class PrismaService {
  private static instance: PrismaService;
  private prisma: PrismaClient;
  private monitor: PerformanceMonitor;

  private constructor() {
    this.prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });
    this.monitor = PerformanceMonitor.getInstance('PrismaService');
    this.setupLogging();
  }

  static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  private setupLogging() {
    this.prisma.$on('query', (e: any) => {
      this.monitor.recordMetric('prisma_query_duration', e.duration);
      if (e.duration > 100) {
        this.monitor.recordWarning('slow_query', {
          query: e.query,
          duration: e.duration,
          timestamp: new Date().toISOString(),
        });
      }
    });

    this.prisma.$on('error', (e: any) => {
      this.monitor.recordError('prisma_error', new Error(e.message));
    });

    this.prisma.$on('warn', (e: any) => {
      this.monitor.recordWarning('prisma_warning', {
        message: e.message,
        timestamp: new Date().toISOString(),
      });
    });
  }

  get client(): PrismaClient {
    return this.prisma;
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
} 