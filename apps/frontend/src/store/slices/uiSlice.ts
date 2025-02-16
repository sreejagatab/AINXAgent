import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  modalState: {
    createPrompt: boolean;
    executePrompt: boolean;
    settings: boolean;
  };
  notifications: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  modalState: {
    createPrompt: false,
    executePrompt: false,
    settings: false,
  },
  notifications: {
    show: false,
    message: '',
    type: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setModalState: (
      state,
      action: PayloadAction<{
        modal: keyof typeof initialState.modalState;
        open: boolean;
      }>
    ) => {
      state.modalState[action.payload.modal] = action.payload.open;
    },
    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        type: UIState['notifications']['type'];
      }>
    ) => {
      state.notifications = {
        show: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    hideNotification: (state) => {
      state.notifications.show = false;
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  setModalState,
  showNotification,
  hideNotification,
} = uiSlice.actions;
export default uiSlice.reducer; 