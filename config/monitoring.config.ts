export const monitoringConfig = {
  elasticsearch: {
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    auth: {
      username: process.env.ELASTICSEARCH_USER || 'elastic',
      password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
    },
    indices: {
      logs: {
        prefix: 'enhanced-ai-agent-logs',
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
          refresh_interval: '5s',
        },
        mappings: {
          properties: {
            '@timestamp': { type: 'date' },
            level: { type: 'keyword' },
            message: { type: 'text' },
            metadata: {
              properties: {
                requestId: { type: 'keyword' },
                userId: { type: 'keyword' },
                method: { type: 'keyword' },
                url: { type: 'keyword' },
                statusCode: { type: 'integer' },
                duration: { type: 'float' },
                error: {
                  properties: {
                    message: { type: 'text' },
                    stack: { type: 'text' },
                  },
                },
              },
            },
          },
        },
      },
      metrics: {
        prefix: 'enhanced-ai-agent-metrics',
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
          refresh_interval: '30s',
        },
        mappings: {
          properties: {
            '@timestamp': { type: 'date' },
            metric: { type: 'keyword' },
            value: { type: 'float' },
            labels: {
              properties: {
                method: { type: 'keyword' },
                route: { type: 'keyword' },
                status: { type: 'integer' },
                type: { type: 'keyword' },
              },
            },
          },
        },
      },
    },
  },
  prometheus: {
    defaultMetrics: {
      enabled: true,
      prefix: 'enhanced_ai_agent_',
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    },
    collectDefaultMetrics: {
      timeout: 5000,
    },
  },
}; 