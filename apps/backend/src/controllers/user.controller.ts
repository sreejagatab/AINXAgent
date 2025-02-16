import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { validateUpdateUser, validatePreferences } from '../validators/user.validator';
import { cache } from '../middleware/cache';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';

export class UserController {
  public async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUser(req.user!.id);
      
      if (!user) {
        throw ApiError.notFound('User not found');
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validateUpdateUser(req.body);
      const user = await userService.updateUser(req.user!.id, data);
      
      // Clear user-related caches
      await cache.invalidatePattern(`user:${req.user!.id}:*`);
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  public async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const preferences = validatePreferences(req.body);
      const user = await userService.updatePreferences(req.user!.id, preferences);
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  public async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteUser(req.user!.id);
      
      // Clear all user-related data
      await cache.invalidatePattern(`user:${req.user!.id}:*`);
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  public async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getUserStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController(); 