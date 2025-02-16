import { useState, useEffect, useCallback } from 'react';
import { errorService } from '../services/error.service';
import { logger } from '../utils/logger';

interface ErrorRecoveryOptions {
  onError?: (error: Error) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

export function useErrorRecovery<T>(
  operation: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [result, setResult] = useState<T | null>(null);

  const {
    onError,
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  const execute = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await operation();
      setResult(data);
      setRetryCount(0);
      return data;
    } catch (error) {
      const shouldRetry = retryCount < retryAttempts;
      setError(error);
      
      if (onError) {
        onError(error);
      }

      if (shouldRetry) {
        logger.warn('Operation failed, retrying...', {
          error,
          attempt: retryCount + 1,
          maxAttempts: retryAttempts,
        });

        await new Promise(resolve => setTimeout(resolve, retryDelay));
        setRetryCount(prev => prev + 1);
        return execute();
      }

      errorService.handleError(error, {
        retryAttempts,
        retryCount,
        operation: operation.name,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [operation, retryCount, retryAttempts, retryDelay, onError]);

  useEffect(() => {
    return () => {
      setIsLoading(false);
      setError(null);
      setRetryCount(0);
      setResult(null);
    };
  }, []);

  return {
    execute,
    isLoading,
    error,
    retryCount,
    result,
    reset: () => {
      setError(null);
      setRetryCount(0);
      setResult(null);
    },
  };
} 