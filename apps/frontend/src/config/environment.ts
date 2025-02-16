interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  API_URL: string;
  WS_URL: string;
  SENTRY_DSN?: string;
  GA_TRACKING_ID?: string;
  ENABLE_MOCK_API: boolean;
  ENABLE_SERVICE_WORKER: boolean;
  AUTH_COOKIE_NAME: string;
  AUTH_COOKIE_DOMAIN: string;
}

const environment: Environment = {
  NODE_ENV: (process.env.NODE_ENV || 'development') as Environment['NODE_ENV'],
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  GA_TRACKING_ID: process.env.REACT_APP_GA_TRACKING_ID,
  ENABLE_MOCK_API: process.env.REACT_APP_ENABLE_MOCK_API === 'true',
  ENABLE_SERVICE_WORKER: process.env.REACT_APP_ENABLE_SERVICE_WORKER === 'true',
  AUTH_COOKIE_NAME: process.env.REACT_APP_AUTH_COOKIE_NAME || 'auth_token',
  AUTH_COOKIE_DOMAIN: process.env.REACT_APP_AUTH_COOKIE_DOMAIN || 'localhost',
};

export const getEnvironment = (): Environment => {
  return environment;
};

export const isDevelopment = (): boolean => environment.NODE_ENV === 'development';
export const isProduction = (): boolean => environment.NODE_ENV === 'production';
export const isTest = (): boolean => environment.NODE_ENV === 'test'; 