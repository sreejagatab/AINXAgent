import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { updateProfile } from '../store/slices/userSlice';
import { User } from '@enhanced-ai-agent/shared';
import { useNotification } from './useNotification';
import { userService } from '../services/user.service';

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
  const user = useAppSelector((state) => state.user.currentUser);

  const updateUserProfile = useCallback(
    async (data: Partial<User>) => {
      try {
        await dispatch(updateProfile(data)).unwrap();
        showNotification('Profile updated successfully', 'success');
      } catch (error: any) {
        showNotification(error.message, 'error');
        throw error;
      }
    },
    [dispatch, showNotification]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        await userService.changePassword(currentPassword, newPassword);
        showNotification('Password changed successfully', 'success');
      } catch (error: any) {
        showNotification(error.message, 'error');
        throw error;
      }
    },
    [showNotification]
  );

  const deleteAccount = useCallback(
    async (password: string) => {
      try {
        await userService.deleteAccount(password);
        showNotification('Account deleted successfully', 'success');
      } catch (error: any) {
        showNotification(error.message, 'error');
        throw error;
      }
    },
    [showNotification]
  );

  return {
    user,
    updateProfile: updateUserProfile,
    changePassword,
    deleteAccount,
  };
}; 