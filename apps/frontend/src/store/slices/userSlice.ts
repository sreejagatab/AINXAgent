import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserPreferences } from '@enhanced-ai-agent/shared';
import { userService } from '../../services/user.service';
import { handleError } from '../../utils/errorHandler';
import { RootState } from '../index';

interface UserState {
  currentUser: User | null;
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  preferences: null,
  loading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getCurrentUser();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      const errorResponse = handleError(error);
      return rejectWithValue(errorResponse.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(data);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      const errorResponse = handleError(error);
      return rejectWithValue(errorResponse.message);
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async (data: Partial<UserPreferences>, { rejectWithValue }) => {
    try {
      const response = await userService.updatePreferences(data);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      const errorResponse = handleError(error);
      return rejectWithValue(errorResponse.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.preferences = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.preferences = action.payload.preferences;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export const selectUser = (state: RootState) => state.user.currentUser;
export const selectPreferences = (state: RootState) => state.user.preferences;
export default userSlice.reducer; 