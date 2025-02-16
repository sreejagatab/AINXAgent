import { z } from 'zod';

export const promptParametersSchema = z.object({
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000),
  topP: z.number().min(0).max(1).default(1),
  frequencyPenalty: z.number().min(-2).max(2).default(0),
  presencePenalty: z.number().min(-2).max(2).default(0),
  stop: z.array(z.string()).optional(),
});

export const promptSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(4000),
  type: z.enum(['completion', 'analysis', 'generation', 'transformation']),
  tags: z.array(z.string()).min(1).max(10),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-2', 'gemini-pro']),
  parameters: promptParametersSchema,
  version: z.number().int().positive().default(1),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  metrics: z.any().optional(),
});

export type PromptParameters = z.infer<typeof promptParametersSchema>;
export type Prompt = z.infer<typeof promptSchema>;

export interface PromptExecutionResult {
  promptId: string;
  model: string;
  input: string;
  output: string;
  duration: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  success: boolean;
  metadata: Record<string, any>;
} 