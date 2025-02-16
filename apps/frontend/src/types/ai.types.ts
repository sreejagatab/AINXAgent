export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    tool?: string;
    [key: string]: any;
  };
};

export type AIResponse = {
  text: string;
  metadata?: {
    model: string;
    tokens: number;
    tool?: string;
    duration?: number;
    [key: string]: any;
  };
};

export type AIError = {
  code: string;
  message: string;
  details?: any;
};

export type AIModel = {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  maxTokens: number;
  pricing: {
    input: number;
    output: number;
  };
};

export type AISettings = {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  autoEvaluate: boolean;
  streamResponse: boolean;
  saveHistory: boolean;
  theme: 'light' | 'dark' | 'system';
};

export type AISession = {
  id: string;
  userId: string;
  messages: Message[];
  settings: AISettings;
  createdAt: Date;
  updatedAt: Date;
};

export type AIUsage = {
  tokens: number;
  requests: number;
  cost: number;
  period: {
    start: Date;
    end: Date;
  };
  breakdown: {
    byModel: Record<string, number>;
    byTool: Record<string, number>;
  };
}; 