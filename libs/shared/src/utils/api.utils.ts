export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export class ApiUtils {
  static createSuccessResponse<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
    return {
      success: true,
      data,
      ...(meta && { meta }),
    };
  }

  static createErrorResponse(error: string): ApiResponse {
    return {
      success: false,
      error,
    };
  }

  static createPaginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
      },
    };
  }
}

export const ERROR_MESSAGES = {
  SERVER_ERROR: 'An unexpected error occurred',
  INVALID_INPUT: 'Invalid input provided',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  RATE_LIMIT: 'Rate limit exceeded',
} as const;

export const RATE_LIMITS = {
  DEFAULT: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // limit each IP to 60 requests per windowMs
  },
  API: {
    windowMs: 60 * 1000,
    max: 30,
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
  },
} as const; 