import { Request, Response, NextFunction } from 'express';
import { ValidationUtils, ApiUtils } from '@enhanced-ai-agent/shared';
import { promptSchema } from '@enhanced-ai-agent/shared';
import { z } from 'zod';
import { AppError } from '../middlewares/error-handler';

const executePromptSchema = z.object({
  input: z.string().min(1).max(4000),
});

const promptParametersSchema = z.object({
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000),
  topP: z.number().min(0).max(1).default(1),
  frequencyPenalty: z.number().min(-2).max(2).default(0),
  presencePenalty: z.number().min(-2).max(2).default(0),
  stop: z.array(z.string()).optional(),
});

const promptCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().min(1, 'Content is required').max(4000),
  type: z.enum(['completion', 'chat', 'edit', 'image']),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  model: z.string().min(1, 'Model is required'),
  parameters: promptParametersSchema,
});

const promptUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(4000).optional(),
  tags: z.array(z.string()).min(1).optional(),
  parameters: promptParametersSchema.optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

const promptExecutionSchema = z.object({
  input: z.string().min(1, 'Input is required'),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(1).max(4000).optional(),
      stream: z.boolean().optional(),
    })
    .optional(),
});

export const validateCreatePrompt = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = promptSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json(
      ApiUtils.createErrorResponse(
        ValidationUtils.getValidationErrors(result.error)
      )
    );
  }

  next();
};

export const validateExecutePrompt = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = executePromptSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json(
      ApiUtils.createErrorResponse(
        ValidationUtils.getValidationErrors(result.error)
      )
    );
  }

  next();
};

export async function validatePromptCreate(data: unknown) {
  try {
    return await promptCreateSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(400, error.errors[0].message);
    }
    throw error;
  }
}

export async function validatePromptUpdate(data: unknown) {
  try {
    return await promptUpdateSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(400, error.errors[0].message);
    }
    throw error;
  }
}

export async function validatePromptExecution(data: unknown) {
  try {
    return await promptExecutionSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(400, error.errors[0].message);
    }
    throw error;
  }
} 