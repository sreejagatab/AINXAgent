import { Middleware } from '@reduxjs/toolkit';
import { authService } from '../services/auth.service';
import { clearUser } from '../store/slices/userSlice';
import { handleError } from '../utils/errorHandler';
import { storage } from '../utils/storage';

export const authMiddleware: Middleware = (store) => (next) => async (action) => {
  // Handle token refresh
  if (action.type === 'user/refreshToken/pending') {
    try {
      const response = await authService.refreshToken();
      if (!response.success) {
        store.dispatch(clearUser());
        storage.clearAll();
        window.location.href = '/login';
      }
    } catch (error) {
      handleError(error);
      store.dispatch(clearUser());
      storage.clearAll();
      window.location.href = '/login';
    }
  }

  // Handle logout
  if (action.type === 'user/logout/fulfilled') {
    storage.clearAll();
  }

  return next(action);
}; 