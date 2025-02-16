import { useState, useEffect, useCallback } from 'react';
import { performanceService } from '../services/performance.service';
import type { PerformanceMetrics } from '../types/performance.types';
import { logger } from '../utils/logger';

export function usePerformance(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(
    performanceService.getMetrics()
  );

  useEffect(() => {
    const startTime = performance.now();
    
    performanceService.startMeasurement(`${componentName}_mount`, {
      component: componentName,
      type: 'mount',
    });

    return () => {
      performanceService.endMeasurement(`${componentName}_mount`, {
        duration: performance.now() - startTime,
      });
    };
  }, [componentName]);

  const measureMemoryUsage = useCallback(async () => {
    try {
      await performanceService.measureMemoryUsage();
    } catch (error) {
      logger.error('Failed to measure memory usage', { error });
    }
  }, []);

  const getResourceLoadTime = useCallback((resourceUrl: string): number => {
    return metrics.resourceLoadTimes[resourceUrl] || 0;
  }, [metrics.resourceLoadTimes]);

  const isPerformanceCritical = useCallback((): boolean => {
    return (
      metrics.firstInputDelay > 100 ||
      metrics.cumulativeLayoutShift > 0.1 ||
      metrics.largestContentfulPaint > 2500
    );
  }, [metrics]);

  const measureOperation = useCallback((
    operationName: string,
    operation: () => Promise<any>,
    metadata?: Record<string, any>
  ) => {
    const measurementName = `${componentName}_${operationName}`;
    
    performanceService.startMeasurement(measurementName, {
      component: componentName,
      operation: operationName,
      ...metadata,
    });

    return operation()
      .then(result => {
        performanceService.endMeasurement(measurementName, {
          status: 'success',
        });
        return result;
      })
      .catch(error => {
        performanceService.endMeasurement(measurementName, {
          status: 'error',
          error: error.message,
        });
        throw error;
      });
  }, [componentName]);

  const trackInteraction = useCallback((
    interactionName: string,
    metadata?: Record<string, any>
  ) => {
    performanceService.trackMetric(`${componentName}_interaction`, {
      interaction: interactionName,
      timestamp: Date.now(),
      ...metadata,
    });
  }, [componentName]);

  return {
    metrics,
    measureMemoryUsage,
    getResourceLoadTime,
    isPerformanceCritical,
    measureOperation,
    trackInteraction,
  };
} 