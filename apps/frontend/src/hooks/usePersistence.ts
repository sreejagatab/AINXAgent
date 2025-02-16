import { useState, useEffect, useCallback } from 'react';
import { persistenceService } from '../services/persistence.service';
import { logger } from '../utils/logger';
import type { PersistenceConfig } from '../types/persistence.types';

export function usePersistence<T>(key: string, initialData: T, config: Partial<PersistenceConfig> = {}) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persistenceConfig: PersistenceConfig = {
    key,
    version: config.version || '1.0.0',
    encrypt: config.encrypt || false,
    compress: config.compress || false,
    expiry: config.expiry,
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const persistedData = await persistenceService.retrieve<T>(persistenceConfig);
        if (persistedData !== null) {
          setData(persistedData);
        }
      } catch (error) {
        const message = 'Failed to load persisted data';
        logger.error(message, { error, key });
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key]);

  const persistData = useCallback(async (newData: T) => {
    try {
      setIsLoading(true);
      setError(null);
      await persistenceService.persist(newData, persistenceConfig);
      setData(newData);
    } catch (error) {
      const message = 'Failed to persist data';
      logger.error(message, { error, key });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [key, persistenceConfig]);

  const clearData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await persistenceService.remove(key);
      setData(initialData);
    } catch (error) {
      const message = 'Failed to clear persisted data';
      logger.error(message, { error, key });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [key, initialData]);

  return {
    data,
    setData: persistData,
    clearData,
    isLoading,
    error,
  };
} 