import { logger } from '../utils/logger';
import { analyticsService } from './analytics.service';
import { storage } from '../utils/storage';

interface ErrorReport {
  id: string;
  error: Error;
  componentStack?: string;
  timestamp: number;
  userAction?: string;
  metadata: Record<string, any>;
}

class ErrorService {
  private static instance: ErrorService;
  private readonly MAX_STORED_ERRORS = 50;
  private readonly ERROR_STORAGE_KEY = 'error_reports';
  private errorHandlers: Set<(error: Error) => void>;

  private constructor() {
    this.errorHandlers = new Set();
    this.initializeGlobalHandlers();
  }

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  private initializeGlobalHandlers(): void {
    window.onerror = (message, source, lineno, colno, error) => {
      this.handleError(error || new Error(String(message)), {
        source,
        line: lineno,
        column: colno,
      });
    };

    window.onunhandledrejection = (event) => {
      this.handleError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
        type: 'unhandled_promise_rejection',
      });
    };
  }

  public async handleError(error: Error, metadata: Record<string, any> = {}): Promise<void> {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      error,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    };

    logger.error('Application error', errorReport);
    await this.storeErrorReport(errorReport);
    this.notifyErrorHandlers(error);
    analyticsService.trackError(error, metadata);

    if (this.shouldShowErrorBoundary(error)) {
      this.triggerErrorBoundary(errorReport);
    }
  }

  private generateErrorId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeErrorReport(report: ErrorReport): Promise<void> {
    try {
      const storedReports = await this.getStoredErrorReports();
      storedReports.unshift(report);

      // Keep only the most recent errors
      if (storedReports.length > this.MAX_STORED_ERRORS) {
        storedReports.length = this.MAX_STORED_ERRORS;
      }

      await storage.setItem(this.ERROR_STORAGE_KEY, JSON.stringify(storedReports));
    } catch (error) {
      logger.error('Failed to store error report', { error });
    }
  }

  public async getStoredErrorReports(): Promise<ErrorReport[]> {
    try {
      const reports = await storage.getItem(this.ERROR_STORAGE_KEY);
      return reports ? JSON.parse(reports) : [];
    } catch (error) {
      logger.error('Failed to retrieve error reports', { error });
      return [];
    }
  }

  public registerErrorHandler(handler: (error: Error) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  private notifyErrorHandlers(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        logger.error('Error handler failed', { error: handlerError });
      }
    });
  }

  private shouldShowErrorBoundary(error: Error): boolean {
    // Implement logic to determine if error boundary should be shown
    return error.name !== 'NetworkError' && error.name !== 'AbortError';
  }

  private triggerErrorBoundary(errorReport: ErrorReport): void {
    window.dispatchEvent(new CustomEvent('app:error', { detail: errorReport }));
  }

  public async clearErrorReports(): Promise<void> {
    try {
      await storage.removeItem(this.ERROR_STORAGE_KEY);
    } catch (error) {
      logger.error('Failed to clear error reports', { error });
    }
  }
}

export const errorService = ErrorService.getInstance(); 