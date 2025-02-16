import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { ApiError } from '../utils/errors';

// Basic security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", ...config.security.allowedHosts],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: true,
  xssFilter: true,
});

// CORS configuration
export const corsConfig = cors({
  origin: (origin, callback) => {
    if (!origin || config.security.corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new ApiError('Not allowed by CORS', 403));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 hours
});

// API key validation
export function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return next();
  }

  // Validate API key format
  if (typeof apiKey !== 'string' || !apiKey.startsWith('ak_')) {
    throw new ApiError('Invalid API key format', 401);
  }

  // Additional API key validation logic here
  // This would typically involve checking against a database

  next();
}

// Content validation
export function validateContent(req: Request, res: Response, next: NextFunction) {
  const contentType = req.headers['content-type'];

  if (req.method !== 'GET' && !contentType?.includes('application/json')) {
    throw new ApiError('Content-Type must be application/json', 415);
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    
    if (contentLength > config.security.maxRequestSize) {
      throw new ApiError('Request entity too large', 413);
    }
  }

  next();
}

// Request sanitization
export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    sanitizeObject(req.body);
  }

  if (req.query) {
    sanitizeObject(req.query);
  }

  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
}

function sanitizeObject(obj: Record<string, any>) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
}

function sanitizeString(str: string): string {
  // Remove potential XSS content
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/style=/gi, '');
} 