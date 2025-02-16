import { Response, NextFunction } from 'express';
import { toolService } from '../services/tool/tool.service';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import { validateTool, validateToolExecution } from '../utils/validation';
import type { AuthRequest } from '../middleware/auth';

export class ToolController {
  public async createTool(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const toolData = validateTool(req.body);
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      logger.info('Creating tool', { userId, toolType: toolData.type });

      const newTool = await toolService.createTool({
        ...toolData,
        userId,
      });

      return res.status(201).json(newTool);
    } catch (error) {
      logger.error('Error creating tool:', error);
      next(error);
    }
  }

  public async getTools(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { type, isPublic } = req.query;

      const tools = await toolService.getTools({
        userId,
        type: type as string,
        isPublic: isPublic === 'true',
      });

      return res.json(tools);
    } catch (error) {
      logger.error('Error fetching tools:', error);
      next(error);
    }
  }

  public async getToolById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const tool = await toolService.getToolById(id, userId);
      if (!tool) {
        throw new ApiError('Tool not found', 404);
      }

      return res.json(tool);
    } catch (error) {
      logger.error('Error fetching tool:', error);
      next(error);
    }
  }

  public async updateTool(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = validateTool(req.body);
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      const updatedTool = await toolService.updateTool(id, updates, userId);
      return res.json(updatedTool);
    } catch (error) {
      logger.error('Error updating tool:', error);
      next(error);
    }
  }

  public async deleteTool(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      await toolService.deleteTool(id, userId);
      return res.json({ message: 'Tool deleted successfully' });
    } catch (error) {
      logger.error('Error deleting tool:', error);
      next(error);
    }
  }

  public async executeTool(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const executionData = validateToolExecution(req.body);
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      logger.info('Executing tool', { userId, toolId: id });

      const result = await toolService.executeTool(id, executionData, userId);
      return res.json(result);
    } catch (error) {
      logger.error('Error executing tool:', error);
      next(error);
    }
  }
}

export const toolController = new ToolController(); 