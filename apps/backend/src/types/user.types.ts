import type { User, UserPreferences as PrismaUserPreferences } from '@prisma/client';

export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  avatar?: string;
}

export interface UserPreferences extends PrismaUserPreferences {
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: string;
  emailNotifications: boolean;
  aiModel: string;
  timezone: string;
}

export interface UserProfile extends Omit<User, 'password'> {
  preferences: UserPreferences | null;
}

export interface UserStats {
  documentCount: number;
  lastLogin: Date | null;
  apiKeyCount: number;
}

export interface UserSession {
  id: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  device?: {
    type: string;
    name: string;
    os: string;
  };
}

export type UserRole = 'ADMIN' | 'USER' | 'EDITOR';

export interface UserActivity {
  id: string;
  type: 'LOGIN' | 'DOCUMENT_CREATE' | 'DOCUMENT_UPDATE' | 'API_ACCESS';
  timestamp: Date;
  metadata?: Record<string, any>;
} 