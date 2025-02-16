import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { updatePreferences } from '../store/slices/userSlice';
import { UserPreferences } from '@enhanced-ai-agent/shared';
import { useNotification } from './useNotification';

export const usePreferences = () => {
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
  const preferences = useAppSelector((state) => state.user.preferences);

  const updateUserPreferences = useCallback(
    async (data: Partial<UserPreferences>) => {
      try {
        await dispatch(updatePreferences(data)).unwrap();
        showNotification('Preferences updated successfully', 'success');
      } catch (error: any) {
        showNotification(error.message, 'error');
        throw error;
      }
    },
    [dispatch, showNotification]
  );

  return {
    preferences,
    updatePreferences: updateUserPreferences,
  };
}; 