export interface AppError extends Error {
  code?: string;
  status?: number;
  details?: Record<string, any>;
  timestamp?: string;
  handled?: boolean;
}

export interface ValidationError extends AppError {
  field: string;
  value: any;
  constraints: Record<string, string>;
}

export interface ApiError extends AppError {
  endpoint: string;
  method: string;
  requestId?: string;
  responseData?: any;
}

export interface SecurityError extends AppError {
  userId?: string;
  action?: string;
  resource?: string;
  attempt?: number;
}

export interface ErrorState {
  lastError?: AppError;
  errorCount: number;
  criticalErrors: AppError[];
}

export type ErrorHandler = (error: AppError) => void;

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export interface ErrorContextType {
  error?: AppError;
  setError: (error: AppError) => void;
  clearError: () => void;
  handleError: ErrorHandler;
}

export interface ErrorReport {
  id: string;
  error: Error;
  componentStack?: string;
  timestamp: number;
  userAction?: string;
  metadata: Record<string, any>;
}

export interface ErrorService {
  handleError(error: Error, metadata?: Record<string, any>): Promise<void>;
  getStoredErrorReports(): Promise<ErrorReport[]>;
  registerErrorHandler(handler: (error: Error) => void): () => void;
  clearErrorReports(): Promise<void>;
}

export interface ErrorRecoveryState<T> {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
  result: T | null;
}

export interface ErrorRecoveryActions {
  execute: () => Promise<any>;
  reset: () => void;
}

export interface ErrorRecoveryOptions {
  onError?: (error: Error) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

export type ErrorRecoveryHook<T> = ErrorRecoveryState<T> & ErrorRecoveryActions; 