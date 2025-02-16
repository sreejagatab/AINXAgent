export interface User extends BaseEntity {
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  aiModel: string;
  language: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  PREMIUM = 'premium',
  API = 'api'
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
  acceptTerms: boolean;
} 