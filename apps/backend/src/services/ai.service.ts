import { Configuration, OpenAIApi } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
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
  private openai: OpenAIApi;
  private anthropic: Anthropic;
  private readonly CACHE_PREFIX = 'ai:';
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor() {
    // Initialize OpenAI
    const openaiConfig = new Configuration({
      apiKey: config.ai.openai.apiKey,
    });
    this.openai = new OpenAIApi(openaiConfig);

    // Initialize Anthropic
    this.anthropic = new Anthropic({
      apiKey: config.ai.anthropic.apiKey,
    });
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async generateResponse(
    prompt: string,
    options: {
      model?: AIModel;
      maxTokens?: number;
      temperature?: number;
      cacheKey?: string;
    } = {}
  ): Promise<AIResponse> {
    const {
      model = 'gpt-4',
      maxTokens = config.ai.openai.maxTokens,
      temperature = 0.7,
      cacheKey,
    } = options;

    // Check cache if cacheKey provided
    if (cacheKey) {
      const cached = await this.getCachedResponse(cacheKey);
      if (cached) return cached;
    }

    try {
      let response: AIResponse;

      if (model.startsWith('gpt')) {
        response = await this.generateOpenAIResponse(prompt, {
          model,
          maxTokens,
          temperature,
        });
      } else if (model.startsWith('claude')) {
        response = await this.generateAnthropicResponse(prompt, {
          model,
          maxTokens,
          temperature,
        });
      } else {
        throw new ApiError(`Unsupported AI model: ${model}`, 400);
      }

      // Cache response if cacheKey provided
      if (cacheKey) {
        await this.cacheResponse(cacheKey, response);
      }

      return response;
    } catch (error) {
      logger.error('AI generation error:', error);
      throw new ApiError('Failed to generate AI response', 500);
    }
  }

  private async generateOpenAIResponse(
    prompt: string,
    options: {
      model: string;
      maxTokens: number;
      temperature: number;
    }
  ): Promise<AIResponse> {
    const { model, maxTokens, temperature } = options;

    const completion = await this.openai.createChatCompletion({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });

    return {
      text: completion.data.choices[0].message?.content || '',
      model,
      usage: completion.data.usage,
      metadata: {
        finishReason: completion.data.choices[0].finish_reason,
        created: completion.data.created,
      },
    };
  }

  private async generateAnthropicResponse(
    prompt: string,
    options: {
      model: string;
      maxTokens: number;
      temperature: number;
    }
  ): Promise<AIResponse> {
    const { model, maxTokens, temperature } = options;

    const completion = await this.anthropic.messages.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });

    return {
      text: completion.content[0].text,
      model,
      usage: {
        prompt_tokens: completion.usage.input_tokens,
        completion_tokens: completion.usage.output_tokens,
        total_tokens: completion.usage.input_tokens + completion.usage.output_tokens,
      },
      metadata: {
        finishReason: completion.stop_reason,
        created: new Date().toISOString(),
      },
    };
  }

  private async getCachedResponse(key: string): Promise<AIResponse | null> {
    const cached = await redis.get(`ai:response:${key}`);
    return cached ? JSON.parse(cached) : null;
  }

  private async cacheResponse(key: string, response: AIResponse): Promise<void> {
    await redis.set(
      `ai:response:${key}`,
      JSON.stringify(response),
      { ttl: 3600 } // 1 hour cache
    );
  }

  public async optimizePrompt(
    template: PromptTemplate,
    variables: Record<string, any>
  ): Promise<string> {
    // Validate required variables
    for (const variable of template.variables) {
      if (variable.required && !(variable.name in variables)) {
        throw new ApiError(`Missing required variable: ${variable.name}`, 400);
      }
    }

    let prompt = template.template;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return prompt;
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

      return await this.generateResponse(messages.map(m => m.content).join('\n'), {
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

      return await this.generateResponse(messages.map(m => m.content).join('\n'), {
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