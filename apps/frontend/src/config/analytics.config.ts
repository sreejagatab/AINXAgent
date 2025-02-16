export const analyticsConfig = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  events: {
    PROMPT_USED: 'prompt_used',
    TOOL_EXECUTED: 'tool_executed',
    EVALUATION_COMPLETED: 'evaluation_completed',
    ERROR_OCCURRED: 'error_occurred',
    USER_AUTHENTICATED: 'user_authenticated',
    SUBSCRIPTION_UPDATED: 'subscription_updated',
    SETTINGS_CHANGED: 'settings_changed',
  },
  dimensions: {
    USER_TYPE: 'user_type',
    SUBSCRIPTION_TIER: 'subscription_tier',
    APP_VERSION: 'app_version',
    ENVIRONMENT: 'environment',
  },
  metrics: {
    PROMPT_TOKENS: 'prompt_tokens',
    COMPLETION_TOKENS: 'completion_tokens',
    RESPONSE_TIME: 'response_time',
    ERROR_COUNT: 'error_count',
    EVALUATION_SCORE: 'evaluation_score',
  },
}; 