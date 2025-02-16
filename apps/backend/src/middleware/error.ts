import { Request, Response, NextFunction } from 'express';
import { ApiError, isApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error handling request:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });

  // Handle known errors
  if (isApiError(error)) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        name: 'ValidationError',
        message: error.message,
        statusCode: 400,
      },
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        name: 'AuthenticationError',
        message: 'Invalid token',
        statusCode: 401,
      },
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        name: 'AuthenticationError',
        message: 'Token expired',
        statusCode: 401,
      },
    });
  }

  // Handle database errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: {
        name: 'DatabaseError',
        message: 'Database operation failed',
        statusCode: 400,
      },
    });
  }

  // Handle unknown errors
  const isProduction = config.env === 'production';
  const errorResponse = {
    error: {
      name: isProduction ? 'InternalServerError' : error.name,
      message: isProduction ? 'Internal server error' : error.message,
      statusCode: 500,
      ...(isProduction ? {} : { stack: error.stack }),
    },
  };

  return res.status(500).json(errorResponse);
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = new ApiError(`Route not found: ${req.path}`, 404);
  next(error);
} 