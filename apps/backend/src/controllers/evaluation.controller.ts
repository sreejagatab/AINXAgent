import { Response, NextFunction } from 'express';
import { evaluationService } from '../services/prompt/prompt-evaluation.service';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import { validateEvaluation } from '../utils/validation';
import type { AuthRequest } from '../middleware/auth';

export class EvaluationController {
  public async createEvaluation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const evaluationData = validateEvaluation(req.body);
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      logger.info('Creating evaluation', { userId, promptId: evaluationData.promptId });

      const evaluation = await evaluationService.createEvaluation({
        ...evaluationData,
        userId,
      });

      return res.status(201).json(evaluation);
    } catch (error) {
      logger.error('Error creating evaluation:', error);
      next(error);
    }
  }

  public async getEvaluations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { promptId } = req.query;
      const userId = req.user?.id;

      const evaluations = await evaluationService.getEvaluations({
        promptId: promptId as string,
        userId,
      });

      return res.json(evaluations);
    } catch (error) {
      logger.error('Error fetching evaluations:', error);
      next(error);
    }
  }

  public async getEvaluationById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const evaluation = await evaluationService.getEvaluationById(id, userId);
      if (!evaluation) {
        throw new ApiError('Evaluation not found', 404);
      }

      return res.json(evaluation);
    } catch (error) {
      logger.error('Error fetching evaluation:', error);
      next(error);
    }
  }

  public async updateEvaluation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = validateEvaluation(req.body);
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      const updatedEvaluation = await evaluationService.updateEvaluation(id, updates, userId);
      return res.json(updatedEvaluation);
    } catch (error) {
      logger.error('Error updating evaluation:', error);
      next(error);
    }
  }

  public async deleteEvaluation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      await evaluationService.deleteEvaluation(id, userId);
      return res.json({ message: 'Evaluation deleted successfully' });
    } catch (error) {
      logger.error('Error deleting evaluation:', error);
      next(error);
    }
  }

  public async getEvaluationMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { promptId } = req.params;
      const metrics = await evaluationService.getEvaluationMetrics(promptId);
      return res.json(metrics);
    } catch (error) {
      logger.error('Error fetching evaluation metrics:', error);
      next(error);
    }
  }
}

export const evaluationController = new EvaluationController(); 