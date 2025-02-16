import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleTheme } from '../store/slices/uiSlice';
import { Theme } from '@mui/material';
import { lightTheme, darkTheme } from '../theme';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.ui.theme);

  const theme: Theme = currentTheme === 'light' ? lightTheme : darkTheme;

  const toggleCurrentTheme = useCallback(() => {
    dispatch(toggleTheme());
    // Save theme preference to local storage
    localStorage.setItem('theme', currentTheme === 'light' ? 'dark' : 'light');
  }, [dispatch, currentTheme]);

  const isDarkMode = currentTheme === 'dark';

  return {
    theme,
    currentTheme,
    isDarkMode,
    toggleTheme: toggleCurrentTheme,
  };
}; 