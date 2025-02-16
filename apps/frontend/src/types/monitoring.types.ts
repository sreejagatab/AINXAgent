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