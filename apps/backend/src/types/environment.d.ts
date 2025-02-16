declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DATABASE_URL: string;
      REDIS_URL: string;
      JWT_SECRET: string;
      JWT_EXPIRY: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASSWORD: string;
      SMTP_SECURE: string;
      EMAIL_FROM: string;
      FRONTEND_URL: string;
      CORS_ORIGINS: string;
      LOG_LEVEL: string;
      OPENAI_API_KEY: string;
      ANTHROPIC_API_KEY: string;
      GEMINI_API_KEY: string;
    }
  }
}

export {}; 