import { Request, Response, NextFunction } from 'express';
import { PromptService } from '../../services/prompt.service';
import { MonitoringService } from '@enhanced-ai-agent/shared';
import { validatePromptCreate, validatePromptUpdate, validatePromptExecution } from '../validators/prompt.validator';
import { validatePagination } from '../validators/base.validator';
import { AppError } from '../middlewares/error-handler';

const promptService = PromptService.getInstance();
const monitoring = MonitoringService.getInstance();

export class PromptController {
  static async createPrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const validatedData = await validatePromptCreate(req.body);
      const result = await promptService.createPrompt({
        ...validatedData,
        userId,
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        throw new AppError(400, result.error || 'Failed to create prompt');
      }
    } catch (error) {
      next(error);
    }
  }

  static async executePrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const promptId = req.params.id;
      const validatedData = await validatePromptExecution(req.body);

      const result = await promptService.executePrompt(
        promptId,
        userId,
        validatedData.input,
        validatedData.options
      );

      if (result.success) {
        res.json(result);
      } else {
        throw new AppError(400, result.error || 'Prompt execution failed');
      }
    } catch (error) {
      next(error);
    }
  }

  static async getPromptHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const pagination = await validatePagination(req.query);
      const result = await promptService.getPromptHistory(userId, pagination);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updatePrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const promptId = req.params.id;
      const validatedData = await validatePromptUpdate(req.body);

      const result = await promptService.updatePrompt(promptId, userId, validatedData);

      if (result.success) {
        res.json(result);
      } else {
        throw new AppError(400, result.error || 'Failed to update prompt');
      }
    } catch (error) {
      next(error);
    }
  }

  static async deletePrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const promptId = req.params.id;
      const result = await promptService.deletePrompt(promptId, userId);

      if (result.success) {
        res.json(result);
      } else {
        throw new AppError(400, result.error || 'Failed to delete prompt');
      }
    } catch (error) {
      next(error);
    }
  }
} 