import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../services/jwt.service';
import { UserService } from '../../services/user.service';
import { AppError } from './error-handler';
import { ApiUtils } from '@enhanced-ai-agent/shared';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';

const monitor = PerformanceMonitor.getInstance('AuthMiddleware');
const jwtService = new JwtService();
const userService = new UserService();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new AppError(401, 'No authentication token provided');
    }

    const decoded = await jwtService.verifyToken(token);
    if (!decoded) {
      throw new AppError(401, 'Invalid token');
    }

    const user = await userService.getUserById(decoded.userId);
    if (!user.success || !user.data.isActive) {
      throw new AppError(401, 'User not found or inactive');
    }

    req.user = {
      id: user.data.id,
      email: user.data.email,
      role: user.data.role,
    };

    next();
  } catch (error) {
    monitor.recordError('authentication_failed', error as Error);
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      if (!roles.includes(req.user.role)) {
        throw new AppError(403, 'Insufficient permissions');
      }

      next();
    } catch (error) {
      monitor.recordError('authorization_failed', error as Error);
      next(error);
    }
  };
};

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const [type, token] = authHeader.split(' ');
  return type === 'Bearer' ? token : null;
}; 