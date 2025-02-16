export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  rateLimit: boolean;
  cache: boolean;
}

export interface ApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;
  details?: Record<string, any>;
}

export interface ApiRequestConfig extends RequestInit {
  retry?: boolean;
  rateLimit?: boolean;
  cache?: boolean;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  requestId?: string;
}

export interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  parameters?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: Record<string, ApiResponse>;
}

export interface ApiParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  schema: any;
  description?: string;
}

export interface ApiRequestBody {
  content: {
    [mediaType: string]: {
      schema: any;
    };
  };
  required?: boolean;
  description?: string;
}

export interface ApiSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  description?: string;
}

export interface ApiDocumentation {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, Record<string, ApiEndpoint>>;
  components: {
    schemas: Record<string, ApiSchema>;
    securitySchemes: Record<string, any>;
  };
} 