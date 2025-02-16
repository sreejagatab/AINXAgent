import { Request, Response, NextFunction } from 'express';
import { ApiUtils } from '@enhanced-ai-agent/shared';
import { ERROR_MESSAGES } from '@enhanced-ai-agent/shared';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      ApiUtils.createErrorResponse(err.message)
    );
  }

  if (err instanceof ZodError) {
    return res.status(400).json(
      ApiUtils.createErrorResponse(err.errors)
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json(
        ApiUtils.createErrorResponse('Duplicate entry found')
      );
    }
    if (err.code === 'P2025') {
      return res.status(404).json(
        ApiUtils.createErrorResponse('Record not found')
      );
    }
  }

  // Default error
  return res.status(500).json(
    ApiUtils.createErrorResponse(ERROR_MESSAGES.SERVER_ERROR)
  );
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 