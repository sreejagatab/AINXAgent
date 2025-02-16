import { z } from 'zod';
import { AppError } from '../middlewares/error-handler';

const userUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark']).optional(),
      language: z.string().min(2).max(5).optional(),
      aiModel: z.string().min(1).max(50).optional(),
      notifications: z
        .object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
          desktop: z.boolean().optional(),
          frequency: z.enum(['realtime', 'daily', 'weekly', 'never']).optional(),
        })
        .optional(),
    })
    .optional(),
});

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export async function validateUserUpdate(data: unknown) {
  try {
    return await userUpdateSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(400, error.errors[0].message);
    }
    throw error;
  }
}

export async function validatePasswordUpdate(data: unknown) {
  try {
    return await passwordUpdateSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(400, error.errors[0].message);
    }
    throw error;
  }
} 