import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = data.body;
      req.query = data.query;
      req.params = data.params;

      next();
    } catch (error) {
      logger.debug('Validation failed:', error);

      if (error.name === 'ZodError') {
        next(
          ApiError.badRequest(
            'Validation failed',
            'VALIDATION_ERROR',
            {
              errors: error.errors.map((e: any) => ({
                path: e.path.join('.'),
                message: e.message,
              })),
            }
          )
        );
        return;
      }

      next(error);
    }
  };
}

export function sanitize(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => sanitize(item));
  }

  if (data && typeof data === 'object') {
    return Object.keys(data).reduce((acc, key) => {
      // Remove any potential XSS content
      if (typeof data[key] === 'string') {
        acc[key] = data[key]
          .replace(/[<>]/g, '') // Remove < and >
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+=/gi, '') // Remove event handlers
          .trim();
      } else {
        acc[key] = sanitize(data[key]);
      }
      return acc;
    }, {} as any);
  }

  return data;
}

export function sanitizeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
} 