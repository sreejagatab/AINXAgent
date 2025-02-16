import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppError, ErrorContextType } from '../types/error.types';
import { logger } from '../utils/logger';
import { analyticsService } from '../services/analytics.service';

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setErrorState] = useState<AppError | undefined>();

  const setError = useCallback((newError: AppError) => {
    setErrorState(newError);
    
    // Log error
    logger.error('Application error', {
      error: newError,
      timestamp: new Date().toISOString(),
    });

    // Track error
    analyticsService.trackEvent('application_error', {
      message: newError.message,
      code: newError.code,
      stack: newError.stack,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState(undefined);
  }, []);

  const handleError = useCallback((error: AppError) => {
    if (error.handled) return;

    error.handled = true;
    error.timestamp = new Date().toISOString();

    // Handle different types of errors
    switch (error.code) {
      case 'VALIDATION_ERROR':
        handleValidationError(error);
        break;
      case 'API_ERROR':
        handleApiError(error);
        break;
      case 'SECURITY_ERROR':
        handleSecurityError(error);
        break;
      default:
        handleGenericError(error);
    }

    setError(error);
  }, [setError]);

  const value = {
    error,
    setError,
    clearError,
    handleError,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

function handleValidationError(error: AppError): void {
  logger.warn('Validation error', { error });
  // Implement validation error specific logic
}

function handleApiError(error: AppError): void {
  logger.error('API error', { error });
  // Implement API error specific logic
}

function handleSecurityError(error: AppError): void {
  logger.error('Security error', { error });
  // Implement security error specific logic
}

function handleGenericError(error: AppError): void {
  logger.error('Generic error', { error });
  // Implement generic error handling logic
} 