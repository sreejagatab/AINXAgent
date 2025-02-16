import { z } from 'zod';
import { PromptParameters, LoginCredentials, RegisterData } from '../types';
import { PROMPT_CONFIG, AUTH_CONFIG } from '../constants';

export const promptParametersSchema = z.object({
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().positive().max(4000),
  topP: z.number().min(0).max(1),
  frequencyPenalty: z.number().min(-2).max(2),
  presencePenalty: z.number().min(-2).max(2),
  stop: z.array(z.string()).optional(),
  context: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(
    AUTH_CONFIG.PASSWORD_MIN_LENGTH,
    `Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters`
  ),
});

export const registerSchema = loginSchema.extend({
  username: z.string().min(3).max(50),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export const promptSchema = z.object({
  title: z.string().min(1).max(PROMPT_CONFIG.MAX_TITLE_LENGTH),
  content: z.string().min(1).max(PROMPT_CONFIG.MAX_CONTENT_LENGTH),
  type: z.enum(['completion', 'chat', 'edit', 'analysis', 'custom']),
  tags: z.array(z.string()).max(PROMPT_CONFIG.MAX_TAGS),
  model: z.enum(PROMPT_CONFIG.SUPPORTED_MODELS as [string, ...string[]]),
  parameters: promptParametersSchema,
});

export class ValidationUtils {
  static validatePromptParameters(params: PromptParameters): boolean {
    try {
      promptParametersSchema.parse(params);
      return true;
    } catch (error) {
      return false;
    }
  }

  static validateLoginCredentials(credentials: LoginCredentials): z.SafeParseReturnType<LoginCredentials, LoginCredentials> {
    return loginSchema.safeParse(credentials);
  }

  static validateRegistration(data: RegisterData): z.SafeParseReturnType<RegisterData, RegisterData> {
    return registerSchema.safeParse(data);
  }

  static getValidationErrors(error: z.ZodError): Record<string, string> {
    return error.errors.reduce((acc, err) => ({
      ...acc,
      [err.path.join('.')]: err.message,
    }), {});
  }
} 