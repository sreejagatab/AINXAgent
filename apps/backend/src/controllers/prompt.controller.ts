import { Response, NextFunction } from 'express';
import { promptService } from '../services/prompt/prompt.service';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import { validatePromptTemplate } from '../utils/validation';
import type { AuthRequest } from '../middleware/auth';

export class PromptController {
  public async createTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = validatePromptTemplate(req.body);
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      logger.info('Creating prompt template', { userId });

      const newTemplate = await promptService.createTemplate({
        ...template,
        userId,
      });

      return res.status(201).json(newTemplate);
    } catch (error) {
      logger.error('Error creating prompt template:', error);
      next(error);
    }
  }

  public async getTemplates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { category, isPublic } = req.query;

      const templates = await promptService.getTemplates({
        userId,
        category: category as string,
        isPublic: isPublic === 'true',
      });

      return res.json(templates);
    } catch (error) {
      logger.error('Error fetching prompt templates:', error);
      next(error);
    }
  }

  public async getTemplateById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const template = await promptService.getTemplateById(id, userId);
      if (!template) {
        throw new ApiError('Template not found', 404);
      }

      return res.json(template);
    } catch (error) {
      logger.error('Error fetching prompt template:', error);
      next(error);
    }
  }

  public async updateTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = validatePromptTemplate(req.body);
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      const updatedTemplate = await promptService.updateTemplate(id, updates, userId);
      return res.json(updatedTemplate);
    } catch (error) {
      logger.error('Error updating prompt template:', error);
      next(error);
    }
  }

  public async deleteTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      await promptService.deleteTemplate(id, userId);
      return res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      logger.error('Error deleting prompt template:', error);
      next(error);
    }
  }

  public async getTemplateVersions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const versions = await promptService.getTemplateVersions(id);
      return res.json(versions);
    } catch (error) {
      logger.error('Error fetching template versions:', error);
      next(error);
    }
  }
}

export const promptController = new PromptController(); 