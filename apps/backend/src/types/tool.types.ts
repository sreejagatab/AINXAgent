export interface Tool {
  id?: string;
  name: string;
  description?: string;
  type: string;
  parameters: Record<string, any>;
  isPublic?: boolean;
  userId?: string;
}

export interface ToolExecution {
  parameters: Record<string, any>;
  timeout?: number;
  async?: boolean;
}

export interface HttpToolConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface DatabaseToolConfig {
  query: string;
  parameters?: Record<string, any>;
  database: string;
  timeout?: number;
}

export interface FunctionToolConfig {
  function: string;
  parameters: Record<string, any>;
  timeout?: number;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  metadata?: Record<string, any>;
}

export type ToolConfig = HttpToolConfig | DatabaseToolConfig | FunctionToolConfig;

export interface ToolDefinition {
  type: string;
  name: string;
  description: string;
  parameters: {
    [key: string]: {
      type: string;
      description: string;
      required: boolean;
      default?: any;
    };
  };
  returns: {
    type: string;
    description: string;
  };
} 