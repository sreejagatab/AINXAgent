import helmet from 'helmet';
import cors from 'cors';
import { Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '@enhanced-ai-agent/shared';

export const configureSecurityMiddleware = (app: Express) => {
  // Basic security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
      exposedHeaders: ['X-Total-Count', 'X-API-Version'],
      credentials: true,
      maxAge: 86400, // 24 hours
    })
  );

  // Global rate limiting
  app.use(
    rateLimit({
      windowMs: RATE_LIMITS.DEFAULT.windowMs,
      max: RATE_LIMITS.DEFAULT.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many requests, please try again later',
      },
    })
  );

  // Content Security Policy
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.API_URL || 'http://localhost:4000'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    })
  );

  // Prevent clickjacking
  app.use(helmet.frameguard({ action: 'deny' }));

  // Hide X-Powered-By header
  app.disable('x-powered-by');

  // Parse JSON payloads
  app.use(express.json({ limit: '10mb' }));

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
}; 