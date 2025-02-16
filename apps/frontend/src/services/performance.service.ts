import { logger } from '../utils/logger';
import { analyticsService } from './analytics.service';
import { storage } from '../utils/storage';

interface PerformanceMetrics {
  timeToFirstByte: number;
  timeToFirstPaint: number;
  timeToFirstContentfulPaint: number;
  timeToInteractive: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  resourceLoadTimes: Record<string, number>;
  memoryUsage?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
}

class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetrics;
  private observers: Set<(metrics: PerformanceMetrics) => void>;

  private constructor() {
    this.observers = new Set();
    this.metrics = this.initializeMetrics();
    this.setupPerformanceObservers();
  }

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      timeToFirstByte: 0,
      timeToFirstPaint: 0,
      timeToFirstContentfulPaint: 0,
      timeToInteractive: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      resourceLoadTimes: {},
    };
  }

  private setupPerformanceObservers(): void {
    // Observe paint timing
    const paintObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        if (entry.name === 'first-paint') {
          this.metrics.timeToFirstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          this.metrics.timeToFirstContentfulPaint = entry.startTime;
        }
      });
      this.notifyObservers();
    });
    paintObserver.observe({ entryTypes: ['paint'] });

    // Observe largest contentful paint
    const lcpObserver = new PerformanceObserver((entries) => {
      const lastEntry = entries.getEntries().pop();
      if (lastEntry) {
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        this.notifyObservers();
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Observe first input delay
    const fidObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        if (entry.duration > this.metrics.firstInputDelay) {
          this.metrics.firstInputDelay = entry.duration;
          this.notifyObservers();
        }
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Observe layout shifts
    const clsObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry: any) => {
        this.metrics.cumulativeLayoutShift += entry.value;
        this.notifyObservers();
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Observe resource timing
    const resourceObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        this.metrics.resourceLoadTimes[entry.name] = entry.duration;
      });
      this.notifyObservers();
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.metrics));
    this.saveMetrics();
  }

  private saveMetrics(): void {
    try {
      storage.setItem('performance_metrics', JSON.stringify(this.metrics));
      analyticsService.trackEvent('performance_metrics_updated', this.metrics);
    } catch (error) {
      logger.error('Failed to save performance metrics', { error });
    }
  }

  public async measureMemoryUsage(): Promise<void> {
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = {
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize,
        };
        this.notifyObservers();
      }
    } catch (error) {
      logger.error('Failed to measure memory usage', { error });
    }
  }
}

export const performanceService = PerformanceService.getInstance(); 