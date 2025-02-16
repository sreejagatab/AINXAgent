import { z } from 'zod';
import { ApiError } from '../utils/errors';
import type { UpdateUserDto, UserPreferences } from '../types/user.types';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string()
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .min(8)
    .optional(),
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional(),
});

export const preferencesSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
  language: z.string().min(2).max(10).optional(),
  emailNotifications: z.boolean().optional(),
  aiModel: z.string().optional(),
  timezone: z.string().optional(),
});

export function validateUpdateUser(data: unknown): UpdateUserDto {
  try {
    return updateUserSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid user data', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
}

export function validatePreferences(data: unknown): Partial<UserPreferences> {
  try {
    return preferencesSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid preferences', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
} 