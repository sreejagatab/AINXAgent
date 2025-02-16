import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { TokenPayload } from '../types/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError('No authorization header', 401);
    }

    const [type, token] = authHeader.split(' ');

    if (type === 'Bearer') {
      req.user = await authService.validateToken(token);
    } else if (type === 'ApiKey') {
      req.user = await authService.validateApiKey(token);
    } else {
      throw new ApiError('Invalid authorization type', 401);
    }

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError('User not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError('Insufficient permissions', 403);
    }

    next();
  };
};

export const rateLimiter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  if (req.user.usageCount >= req.user.usageLimit) {
    throw new ApiError('Usage limit exceeded', 429);
  }

  next();
};

export function validateOwnership(
  getResourceUserId: (req: Request) => Promise<string | null>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const resourceUserId = await getResourceUserId(req);
      if (!resourceUserId) {
        throw ApiError.notFound('Resource not found');
      }

      if (req.user.role !== 'ADMIN' && req.user.userId !== resourceUserId) {
        throw ApiError.forbidden('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
} 