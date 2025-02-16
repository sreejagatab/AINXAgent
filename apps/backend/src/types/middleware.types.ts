import type { Request } from 'express';

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export interface ValidationError {
  path: string;
  message: string;
}

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripIgnoreTag?: boolean;
  stripIgnoreTagBody?: string[];
}

export interface CacheOptions {
  duration?: number;
  key?: string | ((req: Request) => string);
  condition?: (req: Request) => boolean;
}

export interface LogOptions {
  level?: 'error' | 'warn' | 'info' | 'debug';
  skip?: (req: Request) => boolean;
  format?: (req: Request) => Record<string, any>;
}

export interface AuthOptions {
  roles?: string[];
  optional?: boolean;
}

export interface UploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  destination?: string;
  filename?: (req: Request, file: Express.Multer.File) => string;
} 