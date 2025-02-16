export interface AIModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface CompletionRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  maxTokens?: number;
}

export interface EmbeddingRequest {
  text: string;
  model?: string;
}

export interface SearchResult {
  content: string;
  metadata: Record<string, any>;
  score: number;
}

export interface AIResponse<T> {
  data: T;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIError {
  code: string;
  message: string;
  type: 'api_error' | 'invalid_request' | 'rate_limit';
  param?: string;
}

export type AIModel = 
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'claude-2'
  | 'claude-instant';

export type MessageRole = 
  | 'system'
  | 'user'
  | 'assistant'
  | 'function';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  name?: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
}

export interface CompletionOptions {
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
  functions?: AIFunction[];
  functionCall?: 'auto' | 'none' | { name: string };
  onToken?: (token: string) => void;
}

export interface AIResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  functionCall?: {
    name: string;
    arguments: Record<string, any>;
  };
}

export interface AIFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

export interface AIUsage {
  id: string;
  userId: string;
  model: AIModel;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  createdAt: Date;
}

export interface AIMetrics {
  totalRequests: number;
  totalTokens: number;
  averageTokensPerRequest: number;
  costPerModel: Record<AIModel, number>;
  usageByUser: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

export interface ModelCapabilities {
  maxTokens: number;
  supportsFunctions: boolean;
  supportsVision: boolean;
  costPerToken: number;
}

export type PromptVariable = {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description?: string;
  default?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
};

export type PromptTemplate = {
  name: string;
  description?: string;
  template: string;
  variables: PromptVariable[];
  category?: string;
  version: number;
  metadata?: Record<string, any>;
};

export type AIEvaluation = {
  scores: {
    accuracy: number;
    relevance: number;
    coherence: number;
    creativity: number;
    [key: string]: number;
  };
  feedback: string[];
  suggestions: string[];
  metadata?: Record<string, any>;
};

export interface AIService {
  generateResponse(
    prompt: string,
    options?: {
      model?: AIModel;
      maxTokens?: number;
      temperature?: number;
      cacheKey?: string;
    }
  ): Promise<AIResponse>;
  
  optimizePrompt(
    template: PromptTemplate,
    variables: Record<string, any>
  ): Promise<string>;
} 