import { z } from 'zod';
import { ApiError } from '../utils/errors';
import type { 
  ChatMessage, 
  CompletionOptions, 
  AIModel,
  AIConfig
} from '../types/ai.types';

const messageRoleEnum = z.enum(['system', 'user', 'assistant', 'function']);
const modelEnum = z.enum(['gpt-4', 'gpt-4-32k', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k']);

const chatMessageSchema = z.object({
  role: messageRoleEnum,
  content: z.string().min(1),
  name: z.string().optional(),
  functionCall: z.object({
    name: z.string(),
    arguments: z.string(),
  }).optional(),
});

const completionOptionsSchema = z.object({
  model: modelEnum.optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(32000).optional(),
  functions: z.array(z.object({
    name: z.string(),
    description: z.string(),
    parameters: z.object({
      type: z.literal('object'),
      properties: z.record(z.object({
        type: z.string(),
        description: z.string(),
        enum: z.array(z.string()).optional(),
      })),
      required: z.array(z.string()).optional(),
    }),
  })).optional(),
  functionCall: z.union([
    z.literal('auto'),
    z.literal('none'),
    z.object({
      name: z.string(),
    }),
  ]).optional(),
});

const completionRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  options: completionOptionsSchema.optional(),
});

export async function validateCompletion(
  data: unknown
): Promise<{ messages: ChatMessage[]; options: CompletionOptions }> {
  try {
    const validated = await completionRequestSchema.parseAsync(data);
    return {
      messages: validated.messages,
      options: validated.options || {},
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid completion request', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
}

export async function validateModel(model: unknown): Promise<AIModel> {
  try {
    return await modelEnum.parseAsync(model);
  } catch (error) {
    throw ApiError.badRequest('Invalid AI model');
  }
}

export const embeddingSchema = z.object({
  text: z.string().min(1).max(8192),
  model: z.string().optional(),
});

export const analyzeSchema = z.object({
  documentId: z.string().uuid(),
});

export const usageStatsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export function validateEmbeddingRequest(data: unknown) {
  try {
    return embeddingSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid embedding request', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
}

const aiModelEnum = z.enum([
  'gpt-4',
  'gpt-4-turbo-preview',
  'gpt-3.5-turbo',
  'text-embedding-3-small',
]);

const aiConfigSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
});

const aiRequestSchema = z.object({
  prompt: z.string().min(1).max(4000),
  model: aiModelEnum.optional(),
  options: aiConfigSchema.optional(),
});

export async function validateAIRequest(
  data: unknown
): Promise<{
  prompt: string;
  model?: AIModel;
  options?: AIConfig;
}> {
  try {
    return await aiRequestSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid AI request data', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
}

export const promptTemplateSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  description: z.string().optional(),
  variables: z.array(z.string()),
  category: z.string(),
  version: z.number().positive(),
}); 