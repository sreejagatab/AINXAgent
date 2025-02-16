import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { getEnvironment } from '../config/environment';
import { logger } from '../utils/logger';
import { performanceMonitor } from '../utils/performance';

class MonitoringService {
  private static instance: MonitoringService;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public init(): void {
    if (this.initialized) return;

    const { SENTRY_DSN, isProduction } = getEnvironment();

    if (isProduction && SENTRY_DSN) {
      Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [new Integrations.BrowserTracing()],
        tracesSampleRate: 1.0,
        environment: process.env.NODE_ENV,
        beforeSend: (event) => {
          // Sanitize sensitive data
          if (event.request?.headers) {
            delete event.request.headers['Authorization'];
          }
          return event;
        },
      });

      // Set up performance monitoring
      this.setupPerformanceMonitoring();
      
      this.initialized = true;
      logger.info('Monitoring service initialized');
    }
  }

  private setupPerformanceMonitoring(): void {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const timing = performanceMonitor.getNavigationTiming();
      if (timing) {
        Sentry.addBreadcrumb({
          category: 'performance',
          message: 'Page Load Performance',
          data: timing,
        });
      }
    });

    // Monitor long tasks
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) { // Tasks longer than 50ms
          Sentry.addBreadcrumb({
            category: 'performance',
            message: 'Long Task Detected',
            data: {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            },
          });
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  public captureError(error: Error, context?: Record<string, any>): void {
    if (!this.initialized) return;

    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      Sentry.captureException(error);
    });
  }

  public setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.initialized) return;

    Sentry.setUser(user);
  }

  public clearUser(): void {
    if (!this.initialized) return;

    Sentry.setUser(null);
  }

  public addBreadcrumb(
    message: string,
    category?: string,
    data?: Record<string, any>
  ): void {
    if (!this.initialized) return;

    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  }
}

export const monitoringService = MonitoringService.getInstance(); 