import { Middleware } from '@reduxjs/toolkit';
import { monitoringService } from '../services/monitoring.service';
import { RootState } from '../store';
import { monitoringConfig } from '../config/monitoring.config';

export const monitoringMiddleware: Middleware<{}, RootState> = 
  store => next => action => {
    const startTime = performance.now();
    const prevState = store.getState();
    
    try {
      const result = next(action);
      const nextState = store.getState();
      const duration = performance.now() - startTime;

      // Track action performance
      monitoringService.trackPerformanceMetric({
        name: `redux_action_${action.type}`,
        entryType: 'measure',
        startTime,
        duration,
      } as PerformanceEntry);

      // Track state changes
      trackStateChanges(prevState, nextState, action.type);

      return result;
    } catch (error) {
      monitoringService.trackError(error as Error, {
        component: 'ReduxMiddleware',
        action: action.type,
        metadata: {
          actionPayload: action.payload,
          prevState,
        },
      });
      throw error;
    }
  };

function trackStateChanges(
  prevState: RootState,
  nextState: RootState,
  actionType: string
) {
  // Track auth state changes
  if (prevState.auth.user !== nextState.auth.user) {
    monitoringService.trackPerformanceMetric({
      name: 'auth_state_change',
      entryType: 'measure',
      startTime: performance.now(),
      duration: 0,
      metadata: {
        action: actionType,
        hasUser: !!nextState.auth.user,
      },
    } as PerformanceEntry);
  }

  // Track error state changes
  if (prevState.error !== nextState.error) {
    monitoringService.trackPerformanceMetric({
      name: 'error_state_change',
      entryType: 'measure',
      startTime: performance.now(),
      duration: 0,
      metadata: {
        action: actionType,
        errorCount: Object.keys(nextState.error).length,
      },
    } as PerformanceEntry);
  }

  // Track performance critical state changes
  if (
    prevState.ui.loading !== nextState.ui.loading ||
    prevState.ui.loadingCount !== nextState.ui.loadingCount
  ) {
    monitoringService.trackPerformanceMetric({
      name: 'loading_state_change',
      entryType: 'measure',
      startTime: performance.now(),
      duration: 0,
      metadata: {
        action: actionType,
        isLoading: nextState.ui.loading,
        loadingCount: nextState.ui.loadingCount,
      },
    } as PerformanceEntry);
  }
} 