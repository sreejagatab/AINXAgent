export interface PerformanceMetrics {
  dnsLookup: number;
  tcpConnection: number;
  serverResponse: number;
  domLoad: number;
  pageLoad: number;
  total: number;
}

export interface MonitoringEvent {
  name: string;
  category: string;
  data?: Record<string, any>;
  timestamp: string;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface UserMonitoringData {
  id: string;
  email?: string;
  username?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMonitoringConfig {
  longTaskThreshold: number;
  slowActionThreshold: number;
  slowRouteThreshold: number;
  sampleRate: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  environment: string;
  release?: string;
  sampleRate: number;
  performance: PerformanceMonitoringConfig;
  ignoreErrors: string[];
  allowUrls: string[];
  denyUrls: string[];
}

export type MonitoringMetrics = {
  errors: Record<string, number>;
  performance: Record<string, number>;
  usage: Record<string, number>;
  resources: Record<string, number>;
};

export type MetricType = 
  | 'error'
  | 'performance'
  | 'usage'
  | 'resource'
  | 'custom';

export type MetricValue = number | string | boolean;

export type MetricContext = {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
};

export type AlertConfig = {
  type: string;
  threshold: number | string;
  condition: 'gt' | 'lt' | 'eq' | 'contains';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  actions?: AlertAction[];
};

export type AlertAction = {
  type: 'email' | 'slack' | 'webhook';
  target: string;
  template?: string;
  metadata?: Record<string, any>;
};

export type MonitoringConfig = {
  sampleRate: number;
  flushInterval: number;
  maxQueueSize: number;
  alerts: AlertConfig[];
  endpoints: {
    metrics: string;
    alerts: string;
    health: string;
  };
};

export interface MonitoringService {
  trackError(error: Error, context: MetricContext): void;
  trackPerformanceMetric(entry: PerformanceEntry): void;
  getMetrics(): MonitoringMetrics;
}

export interface MonitoringHook {
  trackError: (error: Error, action?: string, metadata?: Record<string, any>) => void;
  trackMetric: (name: string, value: number, metadata?: Record<string, any>) => void;
} 