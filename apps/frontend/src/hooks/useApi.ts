import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';
import { errorHandler } from '../store/middleware/errorLogger';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
}

export const useApi = <T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction(...args);
        
        if (options.onSuccess) {
          options.onSuccess(response);
        }
        
        if (options.successMessage) {
          showNotification(options.successMessage, 'success');
        }
        
        return response;
      } catch (err: any) {
        const errorMessage = errorHandler.handleError(err);
        setError(errorMessage);
        
        if (options.onError) {
          options.onError(err);
        } else {
          showNotification(errorMessage, 'error');
        }
        
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options, showNotification]
  );

  return {
    execute,
    loading,
    error,
    setError,
  };
}; 