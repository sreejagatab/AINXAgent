import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error('Error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known errors
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message,
      details: error.details,
      ...(config.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: error.errors,
    });
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          status: 'error',
          code: 'UNIQUE_CONSTRAINT',
          message: 'Unique constraint violation',
          details: { fields: error.meta?.target },
        });
      case 'P2025':
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: 'Record not found',
        });
      default:
        logger.error('Prisma error:', { error });
        return res.status(500).json({
          status: 'error',
          code: 'DATABASE_ERROR',
          message: 'Database operation failed',
        });
    }
  }

  // Handle all other errors
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: error.stack }),
  });
} 