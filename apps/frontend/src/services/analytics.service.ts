import { Analytics, getAnalytics, logEvent } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { config } from '../config';
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

export class AnalyticsService {
  private static instance: AnalyticsService;
  private analytics: Analytics;
  private initialized: boolean = false;
  private queue: Array<() => void> = [];
  private currentUser: UserProperties | null = null;

  private constructor() {
    const app = initializeApp(config.firebase);
    this.analytics = getAnalytics(app);
  }

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

  public trackEvent(eventName: string, params?: Record<string, any>) {
    try {
      logEvent(this.analytics, eventName, {
        timestamp: new Date().toISOString(),
        ...params,
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  public trackPromptUsage(promptId: string, metadata: {
    category: string;
    model: string;
    tokens: number;
    duration: number;
  }) {
    this.trackEvent('prompt_used', {
      prompt_id: promptId,
      ...metadata,
    });
  }

  public trackToolExecution(toolName: string, metadata: {
    success: boolean;
    duration: number;
    error?: string;
  }) {
    this.trackEvent('tool_executed', {
      tool_name: toolName,
      ...metadata,
    });
  }

  public trackEvaluation(evaluationId: string, metadata: {
    averageScore: number;
    criteria: string[];
    duration: number;
  }) {
    this.trackEvent('evaluation_completed', {
      evaluation_id: evaluationId,
      ...metadata,
    });
  }

  public trackError(error: Error, context: {
    component: string;
    action: string;
    [key: string]: any;
  }) {
    this.trackEvent('error_occurred', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...context,
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