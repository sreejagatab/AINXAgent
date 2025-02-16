import { z } from 'zod';
import type { User, UserRole } from '@prisma/client';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

export interface TokenPayload {
  userId: string;
  role: UserRole;
  exp?: number;
  iat?: number;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface RefreshTokenResponse {
  token: string;
}

export type Role = 'ADMIN' | 'USER' | 'EDITOR';

export interface JwtPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  device?: {
    type: string;
    name: string;
    os: string;
  };
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthMetrics {
  totalUsers: number;
  activeUsers: number;
  loginAttempts: number;
  failedLogins: number;
  passwordResets: number;
} 