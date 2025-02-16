import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../lib/api';
import type { 
  Tool,
  Message,
  PromptTemplate,
  EvaluationResult,
  AIResponse 
} from '../types/ai.types';

interface AIContextValue {
  sendMessage: (
    content: string,
    options?: { tool?: string; userId?: string }
  ) => Promise<AIResponse>;
  getCompletion: (
    prompt: string,
    options?: { model?: string }
  ) => Promise<string>;
  evaluateResponse: (
    prompt: string,
    response: string
  ) => Promise<EvaluationResult>;
  availableTools: Tool[];
  promptTemplates: PromptTemplate[];
  isLoading: boolean;
  error: Error | null;
}

const AIContext = createContext<AIContextValue | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (
    content: string,
    options?: { tool?: string; userId?: string }
  ): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/ai/message', {
        content,
        tool: options?.tool,
        userId: options?.userId,
      });
      return response.data;
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCompletion = useCallback(async (
    prompt: string,
    options?: { model?: string }
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/ai/completion', {
        prompt,
        model: options?.model,
      });
      return response.data.text;
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const evaluateResponse = useCallback(async (
    prompt: string,
    response: string
  ): Promise<EvaluationResult> => {
    try {
      const result = await api.post('/ai/evaluate', {
        prompt,
        response,
      });
      return result.data;
    } catch (error) {
      console.error('Evaluation failed:', error);
      throw error;
    }
  }, []);

  const value = {
    sendMessage,
    getCompletion,
    evaluateResponse,
    availableTools,
    promptTemplates,
    isLoading,
    error,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}; 