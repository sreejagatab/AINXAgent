import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({
  path: path.join(__dirname, '../../../.env'),
});

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_PREFIX: '/api',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Database
  DATABASE_URL: requireEnv('DATABASE_URL'),

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // JWT
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Email
  SMTP_HOST: requireEnv('SMTP_HOST'),
  SMTP_PORT: parseInt(requireEnv('SMTP_PORT'), 10),
  SMTP_USER: requireEnv('SMTP_USER'),
  SMTP_PASS: requireEnv('SMTP_PASS'),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  EMAIL_FROM: requireEnv('EMAIL_FROM'),

  // AI
  OPENAI_API_KEY: requireEnv('OPENAI_API_KEY'),
  AI_MODEL: process.env.AI_MODEL || 'gpt-4',
  AI_TEMPERATURE: parseFloat(process.env.AI_TEMPERATURE || '0.7'),

  // App
  APP_NAME: process.env.APP_NAME || 'AI Agent System',
  APP_URL: requireEnv('APP_URL'),
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || 'support@example.com',

  // Storage
  STORAGE_TYPE: process.env.STORAGE_TYPE || 'local',
  S3_BUCKET: process.env.S3_BUCKET,
  S3_REGION: process.env.S3_REGION,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,

  // Rate Limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests

  // WebSocket
  WS_PORT: parseInt(process.env.WS_PORT || '3001', 10),

  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,
  NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
} as const;

// Type for the config object
export type Config = typeof config; 