import * as Sentry from '@sentry/react';
import { getEnvironment, isProduction } from '../config/environment';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  [key: string]: any;
}

class Logger {
  private static instance: Logger;

  private constructor() {
    if (isProduction()) {
      const { SENTRY_DSN } = getEnvironment();
      if (SENTRY_DSN) {
        Sentry.init({
          dsn: SENTRY_DSN,
          environment: process.env.NODE_ENV,
          tracesSampleRate: 1.0,
        });
      }
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, data?: LogData): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${
      data ? `\n${JSON.stringify(data, null, 2)}` : ''
    }`;
  }

  private log(level: LogLevel, message: string, data?: LogData) {
    const formattedMessage = this.formatMessage(level, message, data);

    if (isProduction()) {
      // Send to Sentry in production
      Sentry.addBreadcrumb({
        category: 'app',
        message: formattedMessage,
        level: level as Sentry.Breadcrumb['level'],
        data,
      });

      if (level === 'error') {
        Sentry.captureMessage(message, {
          level: Sentry.Severity.Error,
          extra: data,
        });
      }
    } else {
      // Log to console in development
      console[level](formattedMessage);
    }
  }

  public info(message: string, data?: LogData) {
    this.log('info', message, data);
  }

  public warn(message: string, data?: LogData) {
    this.log('warn', message, data);
  }

  public error(message: string, data?: LogData) {
    this.log('error', message, data);
  }

  public debug(message: string, data?: LogData) {
    if (!isProduction()) {
      this.log('debug', message, data);
    }
  }
}

export const logger = Logger.getInstance(); 