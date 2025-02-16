export const monitoringConfig = {
  sampleRate: 1.0, // 100% sampling in production
  flushInterval: 10000, // 10 seconds
  maxQueueSize: 100,
  
  alerts: [
    {
      type: 'error_rate',
      threshold: 0.05,
      condition: 'gt',
      severity: 'warning',
      message: 'Error rate exceeded 5%',
      actions: [
        {
          type: 'slack',
          target: process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL,
        },
      ],
    },
    {
      type: 'response_time',
      threshold: 2000,
      condition: 'gt',
      severity: 'warning',
      message: 'Response time exceeded 2 seconds',
      actions: [
        {
          type: 'email',
          target: 'tech-alerts@aiagent.com',
        },
      ],
    },
    {
      type: 'memory_usage',
      threshold: 0.9,
      condition: 'gt',
      severity: 'critical',
      message: 'Memory usage exceeded 90%',
      actions: [
        {
          type: 'slack',
          target: process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL,
        },
        {
          type: 'email',
          target: 'tech-alerts@aiagent.com',
        },
      ],
    },
  ],

  endpoints: {
    metrics: '/api/metrics',
    alerts: '/api/alerts',
    health: '/api/health',
  },

  // Performance thresholds
  performance: {
    fcp: 2000, // First Contentful Paint
    lcp: 2500, // Largest Contentful Paint
    fid: 100, // First Input Delay
    cls: 0.1, // Cumulative Layout Shift
    ttfb: 600, // Time to First Byte
  },

  // Resource thresholds
  resources: {
    maxSize: 5 * 1024 * 1024, // 5MB
    maxRequests: 100,
    cacheTimeout: 3600, // 1 hour
  },
}; 