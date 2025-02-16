export interface ApiErrorOptions {
  code?: string;
  details?: any;
  stack?: string;
}

export interface ErrorResponse {
  error: {
    name: string;
    message: string;
    statusCode: number;
    code?: string;
    details?: any;
    stack?: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface DatabaseError {
  code: string;
  message: string;
  details?: any;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST'
  | 'DATABASE_ERROR'
  | 'INTEGRATION_ERROR'
  | 'SERVICE_UNAVAILABLE';

export interface ErrorMetadata {
  requestId?: string;
  userId?: string;
  path?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface ErrorDetails {
  [key: string]: any;
  cause?: Error;
  target?: string[];
  validationErrors?: ValidationError[];
} 