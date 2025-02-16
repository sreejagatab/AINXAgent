import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PromptService } from '../services/prompt.service';
import { useNotification } from './useNotification';
import { QUERY_KEYS } from '../constants/queryKeys';
import { PromptFilters } from '../types/prompt.types';

export const usePromptService = () => {
  const queryClient = useQueryClient();
  const promptService = PromptService.getInstance();
  const { showNotification } = useNotification();

  const getPrompts = useCallback(
    async (filters: PromptFilters) => {
      const response = await promptService.getPrompts(filters);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    [promptService]
  );

  const createPromptMutation = useMutation(
    async (data: any) => {
      const response = await promptService.createPrompt(data);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_KEYS.PROMPTS]);
        showNotification('Prompt created successfully', 'success');
      },
      onError: (error: Error) => {
        showNotification(error.message, 'error');
      },
    }
  );

  const updatePromptMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await promptService.updatePrompt(id, data);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_KEYS.PROMPTS]);
        showNotification('Prompt updated successfully', 'success');
      },
      onError: (error: Error) => {
        showNotification(error.message, 'error');
      },
    }
  );

  const deletePromptMutation = useMutation(
    async (id: string) => {
      const response = await promptService.deletePrompt(id);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QUERY_KEYS.PROMPTS]);
        showNotification('Prompt deleted successfully', 'success');
      },
      onError: (error: Error) => {
        showNotification(error.message, 'error');
      },
    }
  );

  return {
    getPrompts,
    createPrompt: createPromptMutation.mutateAsync,
    updatePrompt: updatePromptMutation.mutateAsync,
    deletePrompt: deletePromptMutation.mutateAsync,
    isCreating: createPromptMutation.isLoading,
    isUpdating: updatePromptMutation.isLoading,
    isDeleting: deletePromptMutation.isLoading,
  };
}; 