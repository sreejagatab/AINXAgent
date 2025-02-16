export interface ErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface DatabaseError {
  code: string;
  meta?: {
    target?: string[];
    cause?: string;
  };
}

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_ERROR'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'AUTH_ERROR'
  | 'API_ERROR';

export interface ErrorDetails {
  [key: string]: any;
  cause?: Error;
  target?: string[];
  validationErrors?: ValidationError[];
} 