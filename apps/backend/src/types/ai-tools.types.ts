export type ToolParameter = {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  default?: any;
  enum?: string[];
};

export type Tool = {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
  execute: (
    params: Record<string, any>,
    context: ToolContext
  ) => Promise<ToolResult>;
};

export type ToolContext = {
  userId: string;
  sessionId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
};

export type ToolResult = {
  data: any;
  metadata?: {
    duration?: number;
    resourcesUsed?: string[];
    [key: string]: any;
  };
};

export type ToolExecution = {
  toolName: string;
  params: Record<string, any>;
  result?: ToolResult;
  error?: string;
  duration: number;
  userId: string;
  status: 'success' | 'failed';
  createdAt?: Date;
};

export type ToolMetrics = {
  toolName: string;
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  timeRange: {
    start: Date;
    end: Date;
  };
};

export interface ToolRegistry {
  register(tool: Tool): void;
  execute(
    toolName: string,
    params: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult>;
  list(): Tool[];
  get(name: string): Tool | undefined;
}

export type ToolValidationError = {
  parameter: string;
  message: string;
  code: string;
};

export type ToolValidationResult = {
  isValid: boolean;
  errors?: ToolValidationError[];
}; 