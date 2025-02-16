import { useState, useEffect, useCallback } from 'react';
import { performanceService } from '../services/performance.service';
import type { PerformanceMetrics } from '../types/performance.types';
import { logger } from '../utils/logger';

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(
    performanceService.getMetrics()
  );

  useEffect(() => {
    return performanceService.subscribe(setMetrics);
  }, []);

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

  return {
    metrics,
    measureMemoryUsage,
    getResourceLoadTime,
    isPerformanceCritical,
  };
} 