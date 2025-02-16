export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(
    message: string,
    details?: Record<string, any>
  ): ApiError {
    return new ApiError(message, 400, details);
  }

  public static unauthorized(
    message: string = 'Unauthorized',
    details?: Record<string, any>
  ): ApiError {
    return new ApiError(message, 401, details);
  }

  public static forbidden(
    message: string = 'Forbidden',
    details?: Record<string, any>
  ): ApiError {
    return new ApiError(message, 403, details);
  }

  public static notFound(
    message: string = 'Not found',
    details?: Record<string, any>
  ): ApiError {
    return new ApiError(message, 404, details);
  }

  public static tooManyRequests(
    message: string = 'Too many requests',
    details?: Record<string, any>
  ): ApiError {
    return new ApiError(message, 429, details);
  }

  public static internal(
    message: string = 'Internal server error',
    details?: Record<string, any>
  ): ApiError {
    return new ApiError(message, 500, details);
  }

  public toJSON(): Record<string, any> {
    return {
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        details: this.details,
      },
    };
  }
}

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

export const handleError = (error: Error): ApiError => {
  if (isApiError(error)) {
    return error;
  }

  return ApiError.internal(error.message);
}; 