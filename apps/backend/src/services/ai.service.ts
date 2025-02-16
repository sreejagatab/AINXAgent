import { OpenAI } from 'openai';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import type { 
  AIModel, 
  ChatMessage, 
  CompletionOptions,
  AIResponse,
  PromptTemplate,
  CompletionResponse,
  EmbeddingResponse,
  AIMetrics 
} from '../types/ai.types';

export class AIService {
  private static instance: AIService;
  private openai: OpenAI;
  private readonly CACHE_PREFIX = 'ai:';
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
      organization: config.OPENAI_ORG_ID,
    });
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async generateCompletion(
    prompt: string,
    model: AIModel = 'gpt-4',
    options: any = {}
  ): Promise<CompletionResponse> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}completion:${prompt}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const completion = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
        top_p: options.topP ?? 1,
        frequency_penalty: options.frequencyPenalty ?? 0,
        presence_penalty: options.presencePenalty ?? 0,
      });

      const response = {
        text: completion.choices[0].message.content,
        usage: completion.usage,
        model: completion.model,
      };

      await redis.set(cacheKey, JSON.stringify(response), 'EX', this.CACHE_TTL);
      await this.trackCompletion(prompt, response);

      return response;
    } catch (error) {
      logger.error('AI completion failed:', error);
      throw error;
    }
  }

  public async generateEmbeddings(
    texts: string[]
  ): Promise<EmbeddingResponse> {
    try {
      const embeddings = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
      });

      return {
        embeddings: embeddings.data.map(e => e.embedding),
        usage: embeddings.usage,
      };
    } catch (error) {
      logger.error('Embedding generation failed:', error);
      throw error;
    }
  }

  public async getPromptTemplate(
    name: string,
    variables: Record<string, any> = {}
  ): Promise<string> {
    try {
      const template = await prisma.promptTemplate.findUnique({
        where: { name },
      });

      if (!template) {
        throw new Error(`Prompt template ${name} not found`);
      }

      let prompt = template.content;
      for (const [key, value] of Object.entries(variables)) {
        prompt = prompt.replace(`{{${key}}}`, value);
      }

      return prompt;
    } catch (error) {
      logger.error('Failed to get prompt template:', error);
      throw error;
    }
  }

  public async analyzeDocument(
    documentId: string,
    userId: string
  ): Promise<AIResponse> {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: { content: true, title: true },
      });

      if (!document) {
        throw ApiError.notFound('Document not found');
      }

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are an expert document analyzer. Analyze the following document and provide insights.',
        },
        {
          role: 'user',
          content: `Title: ${document.title}\n\nContent: ${document.content}`,
        },
      ];

      return await this.generateCompletion(messages.map(m => m.content).join('\n'), 'gpt-4', {
        temperature: 0.7,
        maxTokens: 500,
        userId,
      });
    } catch (error) {
      logger.error('Document analysis failed:', error);
      throw error;
    }
  }

  public async generateSummary(
    text: string,
    userId: string
  ): Promise<AIResponse> {
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are a summarization expert. Provide a concise summary of the following text.',
        },
        {
          role: 'user',
          content: text,
        },
      ];

      return await this.generateCompletion(messages.map(m => m.content).join('\n'), 'gpt-4', {
        temperature: 0.3,
        maxTokens: 200,
        userId,
      });
    } catch (error) {
      logger.error('Summary generation failed:', error);
      throw error;
    }
  }

  private generateCacheKey(
    messages: ChatMessage[],
    options: CompletionOptions
  ): string {
    const hash = require('crypto')
      .createHash('md5')
      .update(JSON.stringify({ messages, options }))
      .digest('hex');
    return `${this.CACHE_PREFIX}${hash}`;
  }

  private async trackCompletion(
    prompt: string,
    response: CompletionResponse
  ): Promise<void> {
    try {
      await prisma.aiMetrics.create({
        data: {
          prompt,
          model: response.model,
          tokensUsed: response.usage.total_tokens,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to track AI metrics:', error);
    }
  }
}

export const aiService = AIService.getInstance(); 