import { z } from 'zod';
import { ApiError } from '../utils/errors';
import type { LoginDto, RegisterDto, ResetPasswordDto } from '../types/auth.types';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string()
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .min(8, 'Password must be at least 8 characters'),
});

export async function validateLogin(data: unknown): Promise<LoginDto> {
  try {
    return loginSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid login data', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
}

export async function validateRegister(data: unknown): Promise<RegisterDto> {
  try {
    return registerSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid registration data', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
}

export async function validateResetPassword(data: unknown): Promise<ResetPasswordDto> {
  try {
    return resetPasswordSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid password reset data', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
} 