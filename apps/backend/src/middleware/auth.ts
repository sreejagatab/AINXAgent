import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiError } from '../utils/errors';
import type { TokenPayload } from '../types/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(ApiError.unauthorized('No authorization header'));
  }

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Invalid authorization header'));
  }

  authService
    .validateToken(token)
    .then(payload => {
      req.user = payload;
      next();
    })
    .catch(next);
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User not authenticated'));
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
}

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