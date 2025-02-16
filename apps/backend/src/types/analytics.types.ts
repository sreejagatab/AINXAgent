export type AnalyticsEventType =
  | 'page_view'
  | 'user_signup'
  | 'user_login'
  | 'document_create'
  | 'document_update'
  | 'document_delete'
  | 'search_query'
  | 'api_request'
  | 'error';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  properties: Record<string, any>;
  metadata?: {
    userAgent?: string;
    ip?: string;
    referrer?: string;
    path?: string;
  };
}

export type AnalyticsMetric =
  | 'active_users'
  | 'event_counts'
  | 'conversion_rate'
  | 'retention_rate'
  | 'average_session_duration'
  | 'error_rate';

export type TimeRange = '24h' | '7d' | '30d' | '90d';

export interface AnalyticsFilter {
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'contains' | 'in';
  value: any;
}

export interface AnalyticsResult {
  metric: AnalyticsMetric;
  value: number;
  timeRange: TimeRange;
  segments?: Record<string, number>;
  previousValue?: number;
  changePercentage?: number;
}

export interface UserAnalytics {
  userId: string;
  lastSeen: Date;
  sessionCount: number;
  totalDuration: number;
  events: Record<AnalyticsEventType, number>;
  metadata?: Record<string, any>;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  metrics: AnalyticsMetric[];
  filters?: AnalyticsFilter[];
  timeRange: TimeRange;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  lastRun?: Date;
  results?: AnalyticsResult[];
} 