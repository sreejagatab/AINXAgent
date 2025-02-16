import { Middleware } from '@reduxjs/toolkit';
import { analyticsService } from '../services/analytics.service';
import { RootState } from '../store';
import { analyticsConfig } from '../config/analytics.config';

export const analyticsMiddleware: Middleware<{}, RootState> = 
  store => next => action => {
    const prevState = store.getState();
    const result = next(action);
    const nextState = store.getState();

    // Track state changes that we care about
    if (prevState.auth.user !== nextState.auth.user) {
      analyticsService.trackEvent(
        analyticsConfig.events.USER_AUTHENTICATED,
        {
          userId: nextState.auth.user?.id,
          userType: nextState.auth.user?.type,
        }
      );
    }

    if (prevState.subscription !== nextState.subscription) {
      analyticsService.trackEvent(
        analyticsConfig.events.SUBSCRIPTION_UPDATED,
        {
          userId: nextState.auth.user?.id,
          tier: nextState.subscription.tier,
          status: nextState.subscription.status,
        }
      );
    }

    if (prevState.settings !== nextState.settings) {
      analyticsService.trackEvent(
        analyticsConfig.events.SETTINGS_CHANGED,
        {
          userId: nextState.auth.user?.id,
          changes: Object.keys(nextState.settings).filter(
            key => prevState.settings[key] !== nextState.settings[key]
          ),
        }
      );
    }

    return result;
  }; 