export * from './api.types';
export * from './auth.types';
export * from './models.types';
export * from './prompt.types';
export * from './common.types';

// Common type definitions
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Environment configuration type
export interface EnvConfig {
  nodeEnv: string;
  apiKeys: {
    openai: string;
    anthropic: string;
    gemini: string;
  };
  database: {
    url: string;
    redisUrl: string;
  };
  security: {
    jwtSecret: string;
    jwtExpiry: string;
    corsOrigins: string[];
  };
  features: {
    enableWebsockets: boolean;
    enableGraphql: boolean;
    enableBlog: boolean;
  };
} 