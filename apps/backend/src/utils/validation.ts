import { z } from 'zod';
import { ApiError } from './errors';
import type { 
  PromptTemplate, 
  Tool, 
  ToolExecution,
  AIEvaluation 
} from '../types/ai.types';

// User validation schemas
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Prompt validation schemas
export const promptTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  template: z.string().min(10),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
    required: z.boolean(),
    description: z.string().optional(),
    default: z.any().optional(),
    validation: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      enum: z.array(z.any()).optional(),
    }).optional(),
  })),
  category: z.string().optional(),
  isPublic: z.boolean().optional(),
  version: z.number().optional(),
});

// Tool validation schemas
export const toolSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  type: z.string(),
  parameters: z.record(z.any()),
  isPublic: z.boolean().optional(),
});

export const toolExecutionSchema = z.object({
  parameters: z.record(z.any()),
  timeout: z.number().optional(),
  async: z.boolean().optional(),
});

// AI validation schemas
export const promptRequestSchema = z.object({
  prompt: z.string(),
  options: z.object({
    model: z.string().optional(),
    maxTokens: z.number().optional(),
    temperature: z.number().optional(),
    cacheKey: z.string().optional(),
  }).optional(),
});

export const evaluationSchema = z.object({
  promptId: z.string(),
  response: z.string(),
  scores: z.record(z.number()).optional(),
  suggestions: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Validation functions
export function validateRegistration(data: unknown) {
  try {
    return userSchema.parse(data);
  } catch (error) {
    throw new ApiError('Invalid registration data', 400, { details: error });
  }
}

export function validateLogin(data: unknown) {
  try {
    return loginSchema.parse(data);
  } catch (error) {
    throw new ApiError('Invalid login data', 400, { details: error });
  }
}

export function validatePromptTemplate(data: unknown): PromptTemplate {
  try {
    return promptTemplateSchema.parse(data);
  } catch (error) {
    throw new ApiError('Invalid prompt template', 400, { details: error });
  }
}

export function validateTool(data: unknown): Tool {
  try {
    return toolSchema.parse(data);
  } catch (error) {
    throw new ApiError('Invalid tool configuration', 400, { details: error });
  }
}

export function validateToolExecution(data: unknown): ToolExecution {
  try {
    return toolExecutionSchema.parse(data);
  } catch (error) {
    throw new ApiError('Invalid tool execution parameters', 400, { details: error });
  }
}

export function validatePromptRequest(data: unknown) {
  try {
    return promptRequestSchema.parse(data);
  } catch (error) {
    throw new ApiError('Invalid prompt request', 400, { details: error });
  }
}

export function validateEvaluation(data: unknown): AIEvaluation {
  try {
    return evaluationSchema.parse(data);
  } catch (error) {
    throw new ApiError('Invalid evaluation data', 400, { details: error });
  }
}

export function validateToolConfig(type: string, parameters: Record<string, any>) {
  // Implement tool-specific validation logic
  switch (type) {
    case 'http':
      validateHttpToolConfig(parameters);
      break;
    case 'database':
      validateDatabaseToolConfig(parameters);
      break;
    case 'function':
      validateFunctionToolConfig(parameters);
      break;
    default:
      throw new ApiError(`Unsupported tool type: ${type}`, 400);
  }
}

function validateHttpToolConfig(parameters: Record<string, any>) {
  const schema = z.object({
    url: z.string().url(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    headers: z.record(z.string()).optional(),
    body: z.any().optional(),
    timeout: z.number().optional(),
  });

  try {
    schema.parse(parameters);
  } catch (error) {
    throw new ApiError('Invalid HTTP tool configuration', 400, { details: error });
  }
}

function validateDatabaseToolConfig(parameters: Record<string, any>) {
  const schema = z.object({
    query: z.string(),
    parameters: z.record(z.any()).optional(),
    database: z.string(),
    timeout: z.number().optional(),
  });

  try {
    schema.parse(parameters);
  } catch (error) {
    throw new ApiError('Invalid database tool configuration', 400, { details: error });
  }
}

function validateFunctionToolConfig(parameters: Record<string, any>) {
  const schema = z.object({
    function: z.string(),
    parameters: z.record(z.any()),
    timeout: z.number().optional(),
  });

  try {
    schema.parse(parameters);
  } catch (error) {
    throw new ApiError('Invalid function tool configuration', 400, { details: error });
  }
} 