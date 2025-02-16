import { prisma } from '../../lib/prisma';
import { aiService } from '../ai.service';
import { logger } from '../../utils/logger';
import { ApiError } from '../../utils/errors';
import type { AIEvaluation } from '../../types/ai.types';

export class PromptEvaluationService {
  private static instance: PromptEvaluationService;

  private constructor() {}

  public static getInstance(): PromptEvaluationService {
    if (!PromptEvaluationService.instance) {
      PromptEvaluationService.instance = new PromptEvaluationService();
    }
    return PromptEvaluationService.instance;
  }

  public async createEvaluation(data: {
    promptId: string;
    response: string;
    userId: string;
  }) {
    try {
      // Verify prompt exists and user has access
      const prompt = await prisma.prompt.findUnique({
        where: { id: data.promptId },
      });

      if (!prompt) {
        throw new ApiError('Prompt not found', 404);
      }

      // Generate AI evaluation
      const evaluation = await this.evaluateResponse(
        prompt.template,
        data.response
      );

      // Store evaluation
      const result = await prisma.evaluation.create({
        data: {
          promptId: data.promptId,
          userId: data.userId,
          response: data.response,
          scores: evaluation.scores,
          suggestions: evaluation.suggestions,
          metadata: evaluation.metadata,
        },
      });

      return result;
    } catch (error) {
      logger.error('Error creating evaluation:', error);
      throw error;
    }
  }

  public async getEvaluations(params: {
    promptId?: string;
    userId?: string;
  }) {
    try {
      const where: any = {};

      if (params.promptId) {
        where.promptId = params.promptId;
      }

      if (params.userId) {
        where.userId = params.userId;
      }

      return await prisma.evaluation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          prompt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching evaluations:', error);
      throw error;
    }
  }

  public async getEvaluationById(id: string, userId?: string) {
    try {
      const evaluation = await prisma.evaluation.findUnique({
        where: { id },
        include: {
          prompt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!evaluation) {
        throw new ApiError('Evaluation not found', 404);
      }

      // Check access
      if (userId && evaluation.userId !== userId) {
        throw new ApiError('Unauthorized to access evaluation', 403);
      }

      return evaluation;
    } catch (error) {
      logger.error('Error fetching evaluation:', error);
      throw error;
    }
  }

  private async evaluateResponse(
    template: string,
    response: string
  ): Promise<AIEvaluation> {
    try {
      const evaluationPrompt = this.buildEvaluationPrompt(template, response);
      const result = await aiService.generateResponse(evaluationPrompt, {
        temperature: 0.3,
        model: 'gpt-4',
      });

      return this.parseEvaluationResponse(result.text);
    } catch (error) {
      logger.error('Error evaluating response:', error);
      throw error;
    }
  }

  private buildEvaluationPrompt(template: string, response: string): string {
    return `
      You are an expert prompt engineer evaluating the quality of an AI response.
      
      Original Prompt Template:
      ${template}

      Response to Evaluate:
      ${response}

      Please evaluate the response on the following criteria:
      1. Accuracy (0-100): How well does it address the prompt's requirements?
      2. Relevance (0-100): How relevant is the content to the prompt's context?
      3. Coherence (0-100): How well-structured and logical is the response?
      4. Creativity (0-100): How innovative or unique is the approach?

      Provide specific suggestions for improvement.
      
      Format your response as JSON with the following structure:
      {
        "scores": {
          "accuracy": number,
          "relevance": number,
          "coherence": number,
          "creativity": number
        },
        "suggestions": string[],
        "metadata": {
          "strengths": string[],
          "weaknesses": string[]
        }
      }
    `;
  }

  private parseEvaluationResponse(response: string): AIEvaluation {
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '');
      return JSON.parse(cleaned);
    } catch (error) {
      logger.error('Error parsing evaluation response:', error);
      throw new ApiError('Failed to parse evaluation response', 500);
    }
  }
}

export const evaluationService = PromptEvaluationService.getInstance(); 