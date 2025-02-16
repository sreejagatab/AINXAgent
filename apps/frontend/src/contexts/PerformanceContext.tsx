import React, { createContext, useContext, useEffect, useState } from 'react';
import { performanceService } from '../services/performance.service';
import { analyticsService } from '../services/analytics.service';
import { PerformanceMetrics } from '../types/monitoring.types';

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  isPerformant: boolean;
  measureAsync: typeof performanceService.measureAsync;
  measure: typeof performanceService.measure;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    dnsLookup: 0,
    tcpConnection: 0,
    serverResponse: 0,
    domLoad: 0,
    pageLoad: 0,
    total: 0,
  });

  useEffect(() => {
    // Measure initial page load performance
    window.addEventListener('load', () => {
      const timing = performance.timing;
      const updatedMetrics = {
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseEnd - timing.requestStart,
        domLoad: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        pageLoad: timing.loadEventEnd - timing.loadEventStart,
        total: timing.loadEventEnd - timing.navigationStart,
      };

      setMetrics(updatedMetrics);
      analyticsService.trackEvent('page_load_metrics', updatedMetrics);
    });
  }, []);

  const isPerformant = metrics.total < 3000; // Consider page load under 3s as performant

  const value = {
    metrics,
    isPerformant,
    measureAsync: performanceService.measureAsync.bind(performanceService),
    measure: performanceService.measure.bind(performanceService),
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
}; 