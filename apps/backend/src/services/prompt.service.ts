import { PrismaClient } from '@prisma/client';
import { ApiUtils, PromptUtils } from '@enhanced-ai-agent/shared';
import { Prompt, PromptParameters, PromptExecutionResult } from '@enhanced-ai-agent/shared';
import { RedisService } from './redis.service';
import { OpenAIService } from './ai/openai.service';
import { AnthropicService } from './ai/anthropic.service';
import { GeminiService } from './ai/gemini.service';
import { CACHE_KEYS } from '@enhanced-ai-agent/shared';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';
import { PrismaService } from '@enhanced-ai-agent/shared';
import { AIService } from './ai.service';
import { MonitoringService } from '@enhanced-ai-agent/shared';
import { AppError } from '../api/middlewares/error-handler';

export class PromptService {
  private static instance: PromptService;
  private prisma: PrismaService;
  private ai: AIService;
  private monitor: PerformanceMonitor;

  private constructor() {
    this.prisma = PrismaService.getInstance();
    this.ai = AIService.getInstance();
    this.monitor = PerformanceMonitor.getInstance('PromptService');
  }

  static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  async createPrompt(data: {
    userId: string;
    title: string;
    content: string;
    type: string;
    tags: string[];
    model: string;
    parameters: any;
  }) {
    const startTime = Date.now();
    try {
      const prompt = await this.prisma.client.prompt.create({
        data: {
          ...data,
          status: 'draft',
        },
      });

      this.monitor.recordMetric('prompt_creation', Date.now() - startTime);
      return ApiUtils.createSuccessResponse(prompt);
    } catch (error) {
      this.monitor.recordError('prompt_creation_failed', error as Error);
      throw error;
    }
  }

  async executePrompt(
    promptId: string,
    userId: string,
    input: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ) {
    const startTime = Date.now();
    try {
      const prompt = await this.prisma.client.prompt.findUnique({
        where: { id: promptId },
      });

      if (!prompt) {
        throw new AppError(404, 'Prompt not found');
      }

      if (prompt.userId !== userId) {
        throw new AppError(403, 'Not authorized to execute this prompt');
      }

      const result = await this.ai.execute({
        model: prompt.model,
        prompt: this.preparePrompt(prompt.content, input),
        parameters: {
          ...prompt.parameters,
          ...options,
        },
      });

      const execution = await this.prisma.client.promptExecution.create({
        data: {
          promptId,
          input,
          output: result.output,
          tokenUsage: result.tokenUsage,
          duration: Date.now() - startTime,
          status: 'completed',
          metadata: {
            model: prompt.model,
            parameters: {
              ...prompt.parameters,
              ...options,
            },
          },
        },
      });

      this.monitor.recordMetric('prompt_execution', Date.now() - startTime);
      return ApiUtils.createSuccessResponse({
        output: result.output,
        tokenUsage: result.tokenUsage,
        executionId: execution.id,
      });
    } catch (error) {
      this.monitor.recordError('prompt_execution_failed', error as Error);
      throw error;
    }
  }

  private preparePrompt(template: string, input: string): string {
    return template.replace(/\{input\}/g, input);
  }

  async getPromptHistory(userId: string, limit: number = 10): Promise<ApiResponse<Prompt[]>> {
    try {
      const prompts = await this.prisma.client.prompt.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });

      return ApiUtils.createSuccessResponse(prompts);
    } catch (error) {
      this.monitor.recordError('get_prompt_history', error as Error);
      return ApiUtils.createErrorResponse('Failed to fetch prompt history');
    }
  }

  private async updatePromptMetrics(promptId: string, result: PromptExecutionResult): Promise<void> {
    const prompt = await this.prisma.client.prompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt) return;

    const currentMetrics = prompt.metrics as any || {
      successRate: 1,
      averageLatency: result.duration,
      tokenUsage: {
        prompt: 0,
        completion: 0,
        total: 0,
      },
      costEstimate: 0,
      usageCount: 0,
    };

    const newMetrics = {
      successRate: (currentMetrics.successRate * currentMetrics.usageCount + 1) / (currentMetrics.usageCount + 1),
      averageLatency: (currentMetrics.averageLatency * currentMetrics.usageCount + result.duration) / (currentMetrics.usageCount + 1),
      tokenUsage: {
        prompt: currentMetrics.tokenUsage.prompt + result.tokenUsage.prompt,
        completion: currentMetrics.tokenUsage.completion + result.tokenUsage.completion,
        total: currentMetrics.tokenUsage.total + result.tokenUsage.total,
      },
      costEstimate: currentMetrics.costEstimate + PromptUtils.calculateCost(prompt.model as any, result.tokenUsage.total),
      usageCount: currentMetrics.usageCount + 1,
    };

    await this.prisma.client.prompt.update({
      where: { id: promptId },
      data: { metrics: newMetrics },
    });
  }
} 