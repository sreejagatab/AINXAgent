import { jest } from '@jest/globals';
import type { 
  AIResponse, 
  CompletionRequest,
  ToolExecution 
} from '../types/ai.types';

// Mock AI service responses
export const mockAICompletion = jest.fn().mockImplementation(
  async (request: CompletionRequest): Promise<AIResponse> => {
    return {
      data: {
        content: 'Mocked AI response',
        role: 'assistant',
      },
      usage: {
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150,
      },
    };
  }
);

export const mockAIStream = jest.fn().mockImplementation(
  async (
    request: CompletionRequest,
    onData: (chunk: string) => void,
    onComplete: () => void
  ): Promise<void> => {
    onData('Mocked ');
    onData('streaming ');
    onData('response');
    onComplete();
  }
);

// Mock tool execution
export const mockToolExecution = jest.fn().mockImplementation(
  async (execution: ToolExecution) => {
    return {
      success: true,
      data: { result: 'Mocked tool execution result' },
      executionTime: 100,
    };
  }
);

// Mock Redis operations
export const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  hget: jest.fn(),
  hset: jest.fn(),
  hdel: jest.fn(),
  expire: jest.fn(),
  quit: jest.fn(),
};

// Mock WebSocket operations
export const mockWebSocket = {
  emit: jest.fn(),
  to: jest.fn().mockReturnThis(),
  join: jest.fn(),
  leave: jest.fn(),
};

// Mock external API calls
export const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

// Reset all mocks between tests
export function resetMocks() {
  mockAICompletion.mockClear();
  mockAIStream.mockClear();
  mockToolExecution.mockClear();
  mockRedisClient.get.mockClear();
  mockRedisClient.set.mockClear();
  mockWebSocket.emit.mockClear();
  mockAxios.get.mockClear();
  mockAxios.post.mockClear();
} 