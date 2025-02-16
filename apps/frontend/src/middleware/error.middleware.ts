import { Middleware } from '@reduxjs/toolkit';
import { logger } from '../utils/logger';
import { analyticsService } from '../services/analytics.service';
import { securityService } from '../services/security.service';

interface ErrorResponse {
  status: number;
  message: string;
  code?: string;
}

export const errorMiddleware: Middleware = () => (next) => (action) => {
  try {
    const result = next(action);

    // Handle async actions
    if (result instanceof Promise) {
      return result.catch((error: ErrorResponse) => {
        handleError(error, action);
        throw error; // Re-throw to maintain error chain
      });
    }

    return result;
  } catch (error) {
    handleError(error as Error, action);
    throw error; // Re-throw to maintain error chain
  }
};

function handleError(error: ErrorResponse | Error, action: any): void {
  // Log error
  logger.error('Action error', {
    error,
    action: action.type,
    payload: action.payload,
  });

  // Track error
  analyticsService.trackEvent('redux_action_error', {
    actionType: action.type,
    error: error.message,
    timestamp: new Date().toISOString(),
  });

  // Handle specific error types
  if ('status' in error) {
    switch (error.status) {
      case 401:
        securityService.forceLogout('Session expired');
        break;
      case 403:
        handleForbiddenError(error);
        break;
      case 429:
        handleRateLimitError(error);
        break;
      default:
        handleGenericError(error);
    }
  }
}

function handleForbiddenError(error: ErrorResponse): void {
  logger.warn('Forbidden access attempt', { error });
  analyticsService.trackEvent('security_forbidden_access', {
    message: error.message,
    code: error.code,
  });
}

function handleRateLimitError(error: ErrorResponse): void {
  logger.warn('Rate limit exceeded', { error });
  analyticsService.trackEvent('api_rate_limit_exceeded', {
    message: error.message,
  });
}

function handleGenericError(error: ErrorResponse): void {
  // Implement generic error handling logic
  logger.error('Generic error occurred', { error });
} 