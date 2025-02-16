export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(
    statusCode: number,
    message: string,
    code = 'INTERNAL_ERROR',
    details?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details?: Record<string, any>) {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED', details?: Record<string, any>) {
    return new ApiError(401, message, code, details);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN', details?: Record<string, any>) {
    return new ApiError(403, message, code, details);
  }

  static notFound(message = 'Not Found', code = 'NOT_FOUND', details?: Record<string, any>) {
    return new ApiError(404, message, code, details);
  }

  static conflict(message: string, code = 'CONFLICT', details?: Record<string, any>) {
    return new ApiError(409, message, code, details);
  }

  static tooMany(message = 'Too Many Requests', code = 'TOO_MANY_REQUESTS', details?: Record<string, any>) {
    return new ApiError(429, message, code, details);
  }

  static internal(message = 'Internal Server Error', code = 'INTERNAL_ERROR', details?: Record<string, any>) {
    return new ApiError(500, message, code, details);
  }
} 