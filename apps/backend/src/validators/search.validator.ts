import { z } from 'zod';
import { ApiError } from '../utils/errors';
import type { DocSearchParams, SearchOptions } from '../types/search.types';

export const searchParamsSchema = z.object({
  query: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export const searchOptionsSchema = z.object({
  filters: z.array(z.object({
    field: z.string(),
    value: z.union([z.string(), z.array(z.string())]),
    operator: z.enum(['equals', 'contains', 'in', 'hasEvery']).optional(),
  })).optional(),
  sort: z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']),
  }).optional(),
  highlight: z.boolean().optional(),
  includeMetadata: z.boolean().optional(),
});

export const searchStatsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

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

export function validateSearchOptions(data: unknown): SearchOptions {
  try {
    return searchOptionsSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid search options', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
}

export const searchSchemas = {
  searchParams: searchParamsSchema,
  searchOptions: searchOptionsSchema,
  searchStats: searchStatsSchema,
}; 