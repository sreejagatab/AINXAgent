import * as Sentry from '@sentry/react';
import { getEnvironment, isProduction } from '../config/environment';

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public code?: string;
  public details?: any;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export const handleError = (error: any): ErrorResponse => {
  let errorResponse: ErrorResponse = {
    message: 'An unexpected error occurred',
  };

  if (error instanceof AppError) {
    errorResponse = {
      message: error.message,
      code: error.code,
      details: error.details,
    };
  } else if (error.response) {
    // Axios error
    errorResponse = {
      message: error.response.data?.message || error.response.statusText,
      code: error.response.data?.code,
      details: error.response.data?.details,
    };
  } else if (error.request) {
    // Network error
    errorResponse = {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
    };
  } else if (error instanceof Error) {
    errorResponse = {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  if (isProduction() && getEnvironment().SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: {
        code: errorResponse.code,
        details: errorResponse.details,
      },
    });
  } else {
    console.error('Error:', {
      message: errorResponse.message,
      code: errorResponse.code,
      details: errorResponse.details,
      originalError: error,
    });
  }

  return errorResponse;
};

export const createError = (
  message: string,
  code?: string,
  details?: any
): AppError => {
  return new AppError(message, code, details);
}; 