import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/user.service';
import { MonitoringService } from '@enhanced-ai-agent/shared';
import { validateUserUpdate, validatePasswordUpdate } from '../validators/user.validator';
import { AppError } from '../middlewares/error-handler';

const userService = UserService.getInstance();
const monitoring = MonitoringService.getInstance();

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const result = await userService.getUserById(userId);
      if (result.success) {
        res.json(result);
      } else {
        throw new AppError(404, 'User not found');
      }
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const validatedData = await validateUserUpdate(req.body);
      const result = await userService.updateUser(userId, validatedData);

      if (result.success) {
        res.json(result);
      } else {
        throw new AppError(400, result.error || 'Update failed');
      }
    } catch (error) {
      next(error);
    }
  }

  static async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const validatedData = await validatePasswordUpdate(req.body);
      const result = await userService.updatePassword(
        userId,
        validatedData.currentPassword,
        validatedData.newPassword
      );

      if (result.success) {
        res.json(result);
      } else {
        throw new AppError(400, result.error || 'Password update failed');
      }
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const { password } = req.body;
      if (!password) {
        throw new AppError(400, 'Password is required');
      }

      const result = await userService.deleteUser(userId, password);
      if (result.success) {
        res.json(result);
      } else {
        throw new AppError(400, result.error || 'Account deletion failed');
      }
    } catch (error) {
      next(error);
    }
  }
} 