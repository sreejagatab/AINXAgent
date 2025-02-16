import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { authService } from '../services/auth.service';
import { setUser, clearUser } from '../store/slices/userSlice';
import { useNotification } from './useNotification';
import { analytics } from '../utils/analytics';
import { handleError } from '../utils/errorHandler';
import { ROUTES } from '../constants/routes';

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
  const user = useAppSelector((state) => state.user.currentUser);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await authService.login(email, password);
        if (response.success) {
          dispatch(setUser(response.data.user));
          analytics.setUser(response.data.user.id);
          navigate(ROUTES.DASHBOARD);
          showNotification('Login successful', 'success');
        }
      } catch (error) {
        const errorResponse = handleError(error);
        showNotification(errorResponse.message, 'error');
        throw error;
      }
    },
    [dispatch, navigate, showNotification]
  );

  const register = useCallback(
    async (data: { email: string; password: string; username: string }) => {
      try {
        const response = await authService.register(data);
        if (response.success) {
          showNotification(
            'Registration successful. Please verify your email.',
            'success'
          );
          navigate(ROUTES.LOGIN);
        }
      } catch (error) {
        const errorResponse = handleError(error);
        showNotification(errorResponse.message, 'error');
        throw error;
      }
    },
    [navigate, showNotification]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch(clearUser());
      navigate(ROUTES.LOGIN);
      showNotification('Logout successful', 'success');
    } catch (error) {
      const errorResponse = handleError(error);
      showNotification(errorResponse.message, 'error');
    }
  }, [dispatch, navigate, showNotification]);

  const forgotPassword = useCallback(
    async (email: string) => {
      try {
        await authService.forgotPassword(email);
      } catch (error) {
        const errorResponse = handleError(error);
        showNotification(errorResponse.message, 'error');
        throw error;
      }
    },
    [showNotification]
  );

  const resetPassword = useCallback(
    async (token: string, password: string) => {
      try {
        await authService.resetPassword(token, password);
        showNotification('Password reset successful', 'success');
        navigate(ROUTES.LOGIN);
      } catch (error) {
        const errorResponse = handleError(error);
        showNotification(errorResponse.message, 'error');
        throw error;
      }
    },
    [navigate, showNotification]
  );

  return {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };
}; 