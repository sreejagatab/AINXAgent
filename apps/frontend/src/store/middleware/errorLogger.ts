import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import { showNotification } from '../slices/uiSlice';

export const rtkQueryErrorLogger: Middleware = (store) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    console.error('API Error:', action.payload);
    
    // Dispatch error notification
    store.dispatch(
      showNotification({
        message: action.payload.data?.message || 'An error occurred',
        type: 'error',
      })
    );

    // Log to monitoring service if needed
    if (process.env.NODE_ENV === 'production') {
      // Add your error monitoring service here
      // e.g., Sentry, LogRocket, etc.
    }
  }

  return next(action);
};

export const errorHandler = {
  handleError: (error: any) => {
    console.error('Error:', error);

    let message = 'An unexpected error occurred';
    if (error.response) {
      message = error.response.data?.message || error.response.statusText;
    } else if (error.request) {
      message = 'Network error - please check your connection';
    } else if (error.message) {
      message = error.message;
    }

    return message;
  },
}; 