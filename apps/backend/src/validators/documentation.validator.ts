import { z } from 'zod';
import { ApiError } from '../utils/errors';
import type { DocPage, DocSearchParams } from '../types/documentation.types';

const sectionSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
  order: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  codeExamples: z.array(z.object({
    language: z.string(),
    code: z.string(),
    description: z.string().optional(),
  })).optional(),
  metadata: z.record(z.any()).optional(),
});

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  category: z.string().min(1).max(100),
  sections: z.array(sectionSchema).min(1),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial();

export const reorderPagesSchema = z.object({
  pageIds: z.array(z.string().uuid()),
});

export const searchParamsSchema = z.object({
  query: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export function validateDocumentInput(data: unknown): Partial<DocPage> {
  try {
    return createDocumentSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid document data', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
}

export function validateSearchParams(data: unknown): DocSearchParams {
  try {
    return searchParamsSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid search parameters', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
} 