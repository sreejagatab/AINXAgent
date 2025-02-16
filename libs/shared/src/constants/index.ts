export const API_VERSION = 'v1';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const AUTH_CONFIG = {
  TOKEN_EXPIRY: '24h',
  REFRESH_TOKEN_EXPIRY: '7d',
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
};

export const PROMPT_CONFIG = {
  MAX_TITLE_LENGTH: 100,
  MAX_CONTENT_LENGTH: 4000,
  MAX_TAGS: 5,
  DEFAULT_PARAMETERS: {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  SUPPORTED_MODELS: ['gpt-4', 'gpt-3.5-turbo', 'claude-2', 'gemini-pro'],
};

export const RATE_LIMITS = {
  DEFAULT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  AUTH: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 login attempts per hour
  },
  API: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // limit each IP to 60 requests per minute
  },
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_CREDENTIALS: 'Invalid credentials',
  RATE_LIMIT_EXCEEDED: 'Too many requests',
  INVALID_INPUT: 'Invalid input provided',
  SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
};

export const CACHE_KEYS = {
  USER_DATA: 'user:',
  SESSION_DATA: 'session:',
  PROMPT_DATA: 'prompt:',
  RATE_LIMIT: 'rate-limit:',
  METRICS: 'metrics:',
} as const;

export const TOKEN_COSTS = {
  'gpt-4': {
    input: 0.03,
    output: 0.06,
  },
  'gpt-3.5-turbo': {
    input: 0.0015,
    output: 0.002,
  },
  'claude-2': {
    input: 0.0165,
    output: 0.0165,
  },
  'gemini-pro': {
    input: 0.001,
    output: 0.001,
  },
} as const;

export const DEFAULT_LIMITS = {
  MAX_PROMPT_LENGTH: 4000,
  MAX_TITLE_LENGTH: 100,
  MAX_TAGS: 10,
  MAX_CONCURRENT_REQUESTS: 5,
  CACHE_TTL: 3600, // 1 hour
  SESSION_TTL: 86400, // 24 hours
} as const;

export const METRICS = {
  LATENCY_THRESHOLD: 500, // ms
  ERROR_THRESHOLD: 0.01, // 1%
  SUCCESS_THRESHOLD: 0.95, // 95%
  CACHE_HIT_RATIO: 0.8, // 80%
}; 