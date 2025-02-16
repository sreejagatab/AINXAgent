import { Request, Response, NextFunction } from 'express';
import { documentationGenerator } from '../utils/documentation';
import { logger } from '../utils/logger';
import { config } from '../config';

export function serveApiDocs(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    if (config.NODE_ENV === 'production' && !req.user?.role.includes('ADMIN')) {
      res.status(403).json({
        error: 'Not authorized to view API documentation',
      });
      return;
    }

    const spec = documentationGenerator.generateSpec();
    
    if (!documentationGenerator.validateSpec()) {
      throw new Error('Invalid API specification');
    }

    res.json(spec);
  } catch (error) {
    logger.error('Failed to serve API documentation:', error);
    next(error);
  }
}

export function documentRoute(
  path: string,
  method: string,
  definition: any
): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    documentationGenerator.addEndpoint(path, method, definition);
    return descriptor;
  };
} 