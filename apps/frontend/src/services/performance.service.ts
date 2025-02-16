import * as Sentry from '@sentry/react';
import { analyticsService } from './analytics.service';

export class PerformanceService {
  private static instance: PerformanceService;
  private metrics: Map<string, PerformanceMetric>;

  private constructor() {
    this.metrics = new Map();
    this.initializeObservers();
  }

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  private initializeObservers() {
    // Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getLCP }) => {
        getCLS(this.handleCLS.bind(this));
        getFID(this.handleFID.bind(this));
        getLCP(this.handleLCP.bind(this));
      });
    }

    // Performance Observer
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver(this.handlePaintMetrics.bind(this));
      paintObserver.observe({ entryTypes: ['paint'] });

      const navigationObserver = new PerformanceObserver(this.handleNavigationMetrics.bind(this));
      navigationObserver.observe({ entryTypes: ['navigation'] });
    }
  }

  public startMeasurement(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };
    this.metrics.set(name, metric);
  }

  public endMeasurement(name: string, additionalMetadata?: Record<string, any>): void {
    const metric = this.metrics.get(name);
    if (!metric) return;

    const duration = performance.now() - metric.startTime;
    const metadata = { ...metric.metadata, ...additionalMetadata };

    this.trackMetric(name, duration, metadata);
    this.metrics.delete(name);
  }

  private trackMetric(name: string, value: number, metadata?: Record<string, any>) {
    // Track in Sentry
    Sentry.metrics.distribution(name, value, {
      unit: 'millisecond',
      ...metadata,
    });

    // Track in Analytics
    analyticsService.trackEvent('performance_metric', {
      metric: name,
      value,
      ...metadata,
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Performance metric - ${name}:`, {
        value,
        metadata,
      });
    }
  }

  private handleCLS(metric: { value: number }) {
    this.trackMetric('cumulative_layout_shift', metric.value * 1000);
  }

  private handleFID(metric: { value: number }) {
    this.trackMetric('first_input_delay', metric.value);
  }

  private handleLCP(metric: { value: number }) {
    this.trackMetric('largest_contentful_paint', metric.value);
  }

  private handlePaintMetrics(list: PerformanceObserverEntryList) {
    list.getEntries().forEach(entry => {
      this.trackMetric(`paint_${entry.name}`, entry.startTime);
    });
  }

  private handleNavigationMetrics(list: PerformanceObserverEntryList) {
    const navEntry = list.getEntries()[0] as PerformanceNavigationTiming;
    
    this.trackMetric('dom_load', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
    this.trackMetric('page_load', navEntry.loadEventEnd - navEntry.loadEventStart);
    this.trackMetric('ttfb', navEntry.responseStart - navEntry.requestStart);
  }
}

interface PerformanceMetric {
  name: string;
  startTime: number;
  metadata?: Record<string, any>;
}

export const performanceService = PerformanceService.getInstance(); 