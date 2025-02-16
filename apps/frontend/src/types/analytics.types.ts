export type AnalyticsEvent = {
  name: string;
  params?: Record<string, any>;
  timestamp: Date;
  userId?: string;
};

export type PromptAnalytics = {
  promptId: string;
  category: string;
  model: string;
  tokens: number;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
};

export type ToolAnalytics = {
  toolName: string;
  success: boolean;
  duration: number;
  error?: string;
  params?: Record<string, any>;
  result?: Record<string, any>;
};

export type EvaluationAnalytics = {
  evaluationId: string;
  averageScore: number;
  criteria: string[];
  duration: number;
  metadata?: {
    modelUsed: string;
    promptId?: string;
    toolName?: string;
  };
};

export type ErrorAnalytics = {
  name: string;
  message: string;
  stack?: string;
  component: string;
  action: string;
  userId?: string;
  metadata?: Record<string, any>;
};

export type AnalyticsConfig = {
  firebase: {
    apiKey: string;
    projectId: string;
    appId: string;
    measurementId: string;
  };
  events: Record<string, string>;
  dimensions: Record<string, string>;
  metrics: Record<string, string>;
}; 