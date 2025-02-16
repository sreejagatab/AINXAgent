import { z } from 'zod';
import { ApiError } from '../utils/errors';
import type { QueueJob, QueueName } from '../types/queue.types';

const queueNameEnum = z.enum([
  'email',
  'notification',
  'document-processing',
  'export',
]);

const jobOptionsSchema = z.object({
  attempts: z.number().min(1).max(10).optional(),
  backoff: z.object({
    type: z.enum(['fixed', 'exponential']),
    delay: z.number().min(1000).max(3600000),
  }).optional(),
  delay: z.number().min(0).max(86400000).optional(), // Max 24 hours
  priority: z.number().min(1).max(10).optional(),
  removeOnComplete: z.boolean().optional(),
});

const queueJobSchema = z.object({
  queue: queueNameEnum,
  data: z.any(),
  options: jobOptionsSchema.optional(),
});

export async function validateQueueJob(
  data: unknown
): Promise<QueueJob> {
  try {
    return await queueJobSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid queue job data', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
}

export async function validateQueueName(
  name: unknown
): Promise<QueueName> {
  try {
    return await queueNameEnum.parseAsync(name);
  } catch (error) {
    throw ApiError.badRequest('Invalid queue name');
  }
}

export const retryOptionsSchema = z.object({
  attempts: z.number().min(1).max(10).optional(),
  backoff: z.object({
    type: z.enum(['fixed', 'exponential']),
    delay: z.number().min(1000).max(3600000),
  }).optional(),
  removeOnComplete: z.boolean().optional(),
  priority: z.number().min(1).max(10).optional(),
}); 