import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { validateLogin, validateRegister } from '../validators/auth.validator';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';

export class AuthController {
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await validateRegister(req.body);
      const { user, token } = await authService.register(data);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await validateLogin(req.body);
      const { user, token } = await authService.login(data);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw ApiError.unauthorized('No token provided');
      }

      await authService.logout(token);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        throw ApiError.badRequest('Email is required');
      }

      await authService.resetPassword(email);
      res.status(200).json({
        message: 'If an account exists with this email, you will receive password reset instructions.',
      });
    } catch (error) {
      next(error);
    }
  }

  public async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw ApiError.unauthorized('No token provided');
      }

      const user = await authService.verifyToken(token);
      if (!user) {
        throw ApiError.unauthorized('Invalid token');
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController(); 