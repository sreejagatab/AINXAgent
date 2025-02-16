import { useEffect, useCallback } from 'react';
import { monitoringService } from '../services/monitoring.service';
import { useLocation } from 'react-router-dom';
import { performanceMonitor } from '../utils/performance';
import { useAuth } from './useAuth';

export const useMonitoring = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Initialize monitoring service
    monitoringService.init();

    // Set up user monitoring
    if (user) {
      monitoringService.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    }

    // Clean up
    return () => {
      performanceMonitor.clearMarks();
      performanceMonitor.clearMeasures();
    };
  }, [user]);

  // Monitor route changes
  useEffect(() => {
    monitoringService.addBreadcrumb(
      'Route Change',
      'navigation',
      {
        path: location.pathname,
        search: location.search,
        timestamp: new Date().toISOString(),
      }
    );

    // Measure page load performance
    performanceMonitor.mark('route-change-start');
    
    return () => {
      performanceMonitor.mark('route-change-end');
      performanceMonitor.measure(
        'route-change',
        'route-change-start',
        'route-change-end'
      );
    };
  }, [location]);

  const trackEvent = useCallback((
    eventName: string,
    category: string,
    data?: Record<string, any>
  ) => {
    monitoringService.addBreadcrumb(eventName, category, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const trackError = useCallback((
    error: Error,
    context?: Record<string, any>
  ) => {
    monitoringService.captureError(error, context);
  }, []);

  return {
    trackEvent,
    trackError,
  };
}; 