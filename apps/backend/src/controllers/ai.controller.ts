import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { vectorStoreService } from '../services/vector-store.service';
import { EmbeddingsUtil } from '../utils/embeddings';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import type { CompletionRequest, EmbeddingRequest } from '../types/ai.types';
import { validateCompletion, validateAIRequest } from '../validators/ai.validator';
import { prisma } from '../lib/prisma';

export class AIController {
  public async generateCompletion(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, model, options } = await validateAIRequest(req.body);
      
      const completion = await aiService.generateCompletion(
        prompt,
        model,
        options
      );

      res.json(completion);
    } catch (error) {
      next(error);
    }
  }

  public async generateEmbedding(req: Request, res: Response, next: NextFunction) {
    try {
      const request: EmbeddingRequest = req.body;
      
      // Validate and optimize text
      const optimizedText = await EmbeddingsUtil.validateAndOptimizeText(request.text);
      
      const embedding = await aiService.generateEmbedding({
        ...request,
        text: optimizedText,
      });
      
      res.json({ embedding });
    } catch (error) {
      next(error);
    }
  }

  public async analyzeDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;
      if (!documentId) {
        throw ApiError.badRequest('Document ID is required');
      }

      const response = await aiService.analyzeDocument(
        documentId,
        req.user!.id
      );

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  public async generateSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { text } = req.body;
      if (!text) {
        throw ApiError.badRequest('Text is required');
      }

      const response = await aiService.generateSummary(
        text,
        req.user!.id
      );

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  public async streamCompletion(req: Request, res: Response, next: NextFunction) {
    try {
      const { messages, options } = await validateCompletion(req.body);

      // Set up SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = await aiService.streamCompletion(messages, {
        ...options,
        userId: req.user?.id,
        onToken: (token: string) => {
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        },
      });

      stream.on('end', () => {
        res.write('data: [DONE]\n\n');
        res.end();
      });

      stream.on('error', (error) => {
        logger.error('Stream error:', error);
        res.end();
      });

      // Handle client disconnect
      req.on('close', () => {
        stream.destroy();
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAvailableModels(req: Request, res: Response, next: NextFunction) {
    try {
      const models = await aiService.getAvailableModels();
      res.json({ models });
    } catch (error) {
      next(error);
    }
  }

  public async getUsageStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await aiService.getUsageStats(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  public async getPromptTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name } = req.params;
      const variables = req.query;

      const prompt = await aiService.getPromptTemplate(name, variables);
      res.json({ prompt });
    } catch (error) {
      next(error);
    }
  }

  public async getAIMetrics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user?.role.includes('ADMIN')) {
        throw ApiError.forbidden('Not authorized to view AI metrics');
      }

      const metrics = await prisma.aiMetrics.findMany({
        orderBy: { timestamp: 'desc' },
        take: 100,
      });

      res.json(metrics);
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController(); 