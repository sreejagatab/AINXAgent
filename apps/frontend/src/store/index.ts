import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import promptsReducer from './slices/promptsSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';
import { rtkQueryErrorLogger } from './middleware/errorLogger';

export const store = configureStore({
  reducer: {
    prompts: promptsReducer,
    ui: uiReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['prompts/executePrompt/fulfilled'],
      },
    }).concat(rtkQueryErrorLogger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 