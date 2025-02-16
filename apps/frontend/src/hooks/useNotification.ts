import { useCallback } from 'react';
import { useAppDispatch } from '../store';
import { showNotification as showNotificationAction } from '../store/slices/uiSlice';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

export const useNotification = () => {
  const dispatch = useAppDispatch();

  const showNotification = useCallback(
    (message: string, type: NotificationType = 'info') => {
      dispatch(
        showNotificationAction({
          message,
          type,
        })
      );
    },
    [dispatch]
  );

  return { showNotification };
}; 