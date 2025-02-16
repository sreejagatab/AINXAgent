export const QUERY_KEYS = {
  PROMPTS: 'prompts',
  PROMPT_HISTORY: 'prompt-history',
  USER_PROFILE: 'user-profile',
  USER_PREFERENCES: 'user-preferences',
  NOTIFICATIONS: 'notifications',
  METRICS: 'metrics',
  USAGE_STATS: 'usage-stats',
  BILLING: 'billing',
  API_KEYS: 'api-keys',
} as const;

export const MUTATION_KEYS = {
  CREATE_PROMPT: 'create-prompt',
  UPDATE_PROMPT: 'update-prompt',
  DELETE_PROMPT: 'delete-prompt',
  EXECUTE_PROMPT: 'execute-prompt',
  UPDATE_PROFILE: 'update-profile',
  UPDATE_PREFERENCES: 'update-preferences',
  GENERATE_API_KEY: 'generate-api-key',
  REVOKE_API_KEY: 'revoke-api-key',
} as const; 