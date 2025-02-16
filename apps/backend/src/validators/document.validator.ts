import { z } from 'zod';
import { ApiError } from '../utils/errors';
import type { CreateDocumentDto, UpdateDocumentDto } from '../types/document.types';

const createDocumentSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  content: z.string()
    .min(1, 'Content is required')
    .max(100000, 'Content must be at most 100,000 characters'),
  tags: z.array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  published: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateDocumentSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters')
    .optional(),
  content: z.string()
    .min(1, 'Content is required')
    .max(100000, 'Content must be at most 100,000 characters')
    .optional(),
  tags: z.array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  published: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function validateCreateDocument(
  data: unknown
): Promise<CreateDocumentDto> {
  try {
    return await createDocumentSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid document data', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
}

export async function validateUpdateDocument(
  data: unknown
): Promise<UpdateDocumentDto> {
  try {
    return await updateDocumentSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid document data', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
}

export const documentFilterSchema = z.object({
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  authorId: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}); 