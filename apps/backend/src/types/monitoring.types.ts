export interface SystemMetrics {
  timestamp: Date;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  process: {
    uptime: number;
    pid: number;
  };
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: Date;
  services: {
    database: {
      status: 'up' | 'down';
      latency: number;
    };
    cache: {
      status: 'up' | 'down';
      latency: number;
    };
    api: {
      status: 'up' | 'down';
      version: string;
    };
  };
  metrics: {
    cpu: {
      user: number;
      system: number;
    };
    memory: {
      used: number;
      total: number;
    };
  };
}

export interface ErrorMetrics {
  total: number;
  byType: Record<string, number>;
  byEndpoint: Record<string, number>;
  recentErrors: Array<{
    name: string;
    message: string;
    count: number;
    lastOccurred: Date;
  }>;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  byEndpoint: Record<string, {
    count: number;
    average: number;
    p95: number;
    p99: number;
  }>;
  slowestEndpoints: Array<{
    path: string;
    method: string;
    averageTime: number;
    count: number;
  }>;
}

export interface LogEntry {
  id: string;
  level: string;
  message: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface LogFilter {
  level?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
} 