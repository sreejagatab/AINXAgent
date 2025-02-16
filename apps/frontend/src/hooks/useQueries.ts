import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { PromptData, ToolData, EvaluationData } from '../lib/validations';

// Prompt queries
export function usePrompts(params?: PromptListParams) {
  return useQuery({
    queryKey: ['prompts', params],
    queryFn: () => apiClient.prompts.list(params),
  });
}

export function usePrompt(id: string) {
  return useQuery({
    queryKey: ['prompts', id],
    queryFn: () => apiClient.prompts.get(id),
  });
}

export function useCreatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PromptData) => apiClient.prompts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

// Tool queries
export function useTools(params?: ToolListParams) {
  return useQuery({
    queryKey: ['tools', params],
    queryFn: () => apiClient.tools.list(params),
  });
}

export function useTool(id: string) {
  return useQuery({
    queryKey: ['tools', id],
    queryFn: () => apiClient.tools.get(id),
  });
}

export function useCreateTool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToolData) => apiClient.tools.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
}

// Evaluation queries
export function useEvaluatePrompt(promptId: string) {
  return useMutation({
    mutationFn: (data: EvaluationData) =>
      apiClient.prompts.evaluate(promptId, data),
  });
} 