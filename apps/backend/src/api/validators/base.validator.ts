import { z } from 'zod';
import { AppError } from '../middlewares/error-handler';

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .default(20),
});

export const idSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export async function validatePagination(data: unknown) {
  try {
    return await paginationSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(400, error.errors[0].message);
    }
    throw error;
  }
}

export async function validateId(data: unknown) {
  try {
    return await idSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(400, error.errors[0].message);
    }
    throw error;
  }
}

export function createValidationMiddleware(schema: z.ZodSchema) {
  return async (req: any, res: any, next: any) => {
    try {
      req.validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, error.errors[0].message));
      } else {
        next(error);
      }
    }
  };
} 