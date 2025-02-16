import { Middleware } from '@reduxjs/toolkit';
import { monitoringService } from '../services/monitoring.service';
import { performanceMonitor } from '../utils/performance';

export const monitoringMiddleware: Middleware = () => (next) => (action) => {
  // Start measuring action duration
  const actionStartTime = performance.now();
  performanceMonitor.mark(`action-start-${action.type}`);

  // Add breadcrumb for action
  monitoringService.addBreadcrumb(
    `Redux Action: ${action.type}`,
    'redux',
    {
      payload: action.payload,
      timestamp: new Date().toISOString(),
    }
  );

  // Execute action
  const result = next(action);

  // Measure action duration
  performanceMonitor.mark(`action-end-${action.type}`);
  const duration = performance.now() - actionStartTime;

  // Log long-running actions
  if (duration > 100) { // Actions taking longer than 100ms
    monitoringService.addBreadcrumb(
      'Long Running Action',
      'performance',
      {
        actionType: action.type,
        duration,
        timestamp: new Date().toISOString(),
      }
    );
  }

  return result;
}; 