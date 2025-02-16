import { Request, Response, NextFunction } from 'express';
import { ValidationUtils, ApiUtils } from '@enhanced-ai-agent/shared';
import { loginSchema, registerSchema } from '@enhanced-ai-agent/shared';
import { z } from 'zod';
import { AppError } from '../middlewares/error-handler';

const registrationSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must not exceed 255 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const result = ValidationUtils.validateLoginCredentials(req.body);

  if (!result.success) {
    return res.status(400).json(
      ApiUtils.createErrorResponse(
        ValidationUtils.getValidationErrors(result.error)
      )
    );
  }

  next();
};

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = ValidationUtils.validateRegistration(req.body);

  if (!result.success) {
    return res.status(400).json(
      ApiUtils.createErrorResponse(
        ValidationUtils.getValidationErrors(result.error)
      )
    );
  }

  next();
};

export const validatePasswordReset = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json(
      ApiUtils.createErrorResponse('Invalid password format')
    );
  }

  next();
};

export async function validateRegistration(data: unknown) {
  try {
    return await registrationSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(400, error.errors[0].message);
    }
    throw error;
  }
}

export async function validateLogin(data: unknown) {
  try {
    return await loginSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(400, error.errors[0].message);
    }
    throw error;
  }
} 