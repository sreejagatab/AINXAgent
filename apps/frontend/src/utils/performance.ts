import { getEnvironment, isProduction } from '../config/environment';
import { analytics } from './analytics';
import { logger } from './logger';

class Performance {
  private static instance: Performance;
  private marks: Map<string, number>;

  private constructor() {
    this.marks = new Map();
  }

  public static getInstance(): Performance {
    if (!Performance.instance) {
      Performance.instance = new Performance();
    }
    return Performance.instance;
  }

  public mark(name: string) {
    if (!isProduction()) return;
    
    const timestamp = performance.now();
    this.marks.set(name, timestamp);
    performance.mark(name);
  }

  public measure(name: string, startMark: string, endMark: string) {
    if (!isProduction()) return;

    try {
      const measure = performance.measure(name, startMark, endMark);
      const duration = measure.duration;

      // Log to analytics
      analytics.timing('Performance', name, duration);

      // Log to console in development
      logger.debug(`Performance measure: ${name}`, {
        duration,
        startMark,
        endMark,
      });

      return duration;
    } catch (error) {
      logger.error('Error measuring performance', { error, name, startMark, endMark });
    }
  }

  public clearMarks() {
    this.marks.clear();
    performance.clearMarks();
  }

  public clearMeasures() {
    performance.clearMeasures();
  }

  public getNavigationTiming() {
    if (typeof window === 'undefined') return null;

    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!timing) return null;

    return {
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnection: timing.connectEnd - timing.connectStart,
      serverResponse: timing.responseEnd - timing.requestStart,
      domLoad: timing.domContentLoadedEventEnd - timing.loadEventStart,
      pageLoad: timing.loadEventEnd - timing.loadEventStart,
      total: timing.loadEventEnd - timing.navigationStart,
    };
  }
}

export const performanceMonitor = Performance.getInstance(); 