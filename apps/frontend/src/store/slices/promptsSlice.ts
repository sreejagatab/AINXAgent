import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PromptService } from '../../services/prompt.service';
import { Prompt, ApiResponse } from '@enhanced-ai-agent/shared';
import { RootState } from '../index';

interface PromptsState {
  items: Prompt[];
  selectedPrompt: Prompt | null;
  loading: boolean;
  error: string | null;
  filters: {
    type: string;
    status: string;
    search: string;
  };
  execution: {
    loading: boolean;
    error: string | null;
    result: any | null;
  };
}

const initialState: PromptsState = {
  items: [],
  selectedPrompt: null,
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'active',
    search: '',
  },
  execution: {
    loading: false,
    error: null,
    result: null,
  },
};

const promptService = PromptService.getInstance();

export const fetchPrompts = createAsyncThunk(
  'prompts/fetchPrompts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const response = await promptService.getPrompts(state.prompts.filters);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const executePrompt = createAsyncThunk(
  'prompts/executePrompt',
  async (
    {
      promptId,
      input,
      options,
    }: { promptId: string; input: string; options?: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await promptService.executePrompt(promptId, input, options);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const promptsSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<typeof state.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedPrompt: (state, action: PayloadAction<Prompt | null>) => {
      state.selectedPrompt = action.payload;
    },
    clearExecutionResult: (state) => {
      state.execution.result = null;
      state.execution.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrompts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrompts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPrompts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(executePrompt.pending, (state) => {
        state.execution.loading = true;
        state.execution.error = null;
      })
      .addCase(executePrompt.fulfilled, (state, action) => {
        state.execution.loading = false;
        state.execution.result = action.payload;
      })
      .addCase(executePrompt.rejected, (state, action) => {
        state.execution.loading = false;
        state.execution.error = action.payload as string;
      });
  },
});

export const { setFilters, setSelectedPrompt, clearExecutionResult } = promptsSlice.actions;
export default promptsSlice.reducer; 