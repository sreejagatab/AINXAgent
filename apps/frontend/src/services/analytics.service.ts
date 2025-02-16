import { analytics as baseAnalytics } from '../utils/analytics';
import { getEnvironment } from '../config/environment';
import { logger } from '../utils/logger';

interface EventProperties {
  [key: string]: string | number | boolean;
}

interface UserProperties {
  id: string;
  email?: string;
  role?: string;
  plan?: string;
  [key: string]: any;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized: boolean = false;
  private queue: Array<() => void> = [];
  private currentUser: UserProperties | null = null;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public init(): void {
    if (this.initialized) return;

    const { GA_TRACKING_ID, isProduction } = getEnvironment();

    if (isProduction && GA_TRACKING_ID) {
      baseAnalytics.init();
      this.initialized = true;
      this.processQueue();
      logger.info('Analytics service initialized');
    }
  }

  private processQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      event?.();
    }
  }

  private enqueue(event: () => void): void {
    if (this.initialized) {
      event();
    } else {
      this.queue.push(event);
    }
  }

  public setUser(user: UserProperties): void {
    this.currentUser = user;
    this.enqueue(() => {
      baseAnalytics.setUser(user.id);
      this.trackEvent('user_identified', {
        userId: user.id,
        userRole: user.role,
        userPlan: user.plan,
      });
    });
  }

  public clearUser(): void {
    this.currentUser = null;
    this.enqueue(() => {
      baseAnalytics.setUser(null);
    });
  }

  public trackEvent(
    eventName: string,
    properties?: EventProperties,
    category?: string
  ): void {
    this.enqueue(() => {
      const enrichedProperties = {
        ...properties,
        timestamp: new Date().toISOString(),
        environment: getEnvironment().NODE_ENV,
        userId: this.currentUser?.id,
        userRole: this.currentUser?.role,
      };

      baseAnalytics.event(
        category || 'general',
        eventName,
        JSON.stringify(enrichedProperties)
      );

      logger.debug('Analytics event tracked', {
        eventName,
        properties: enrichedProperties,
      });
    });
  }

  public trackPageView(path: string, title?: string): void {
    this.enqueue(() => {
      baseAnalytics.pageView(path);
      this.trackEvent('page_view', {
        path,
        title: title || document.title,
      });
    });
  }

  public trackError(error: Error, context?: Record<string, any>): void {
    this.enqueue(() => {
      baseAnalytics.exception(error.message, true);
      this.trackEvent('error', {
        errorMessage: error.message,
        errorStack: error.stack,
        ...context,
      });
    });
  }

  public trackTiming(
    category: string,
    variable: string,
    value: number,
    label?: string
  ): void {
    this.enqueue(() => {
      baseAnalytics.timing(category, variable, value, label);
    });
  }
}

export const analyticsService = AnalyticsService.getInstance(); 