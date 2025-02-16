import type { Job } from 'bull';
import type { EmailOptions } from './email.types';
import type { NotificationType } from './notification.types';
import type { AnalyticsEvent } from './analytics.types';
import type { JobOptions } from 'bull';

export type JobType = 
  | 'email'
  | 'notification'
  | 'document-processing'
  | 'analytics'
  | 'cleanup';

export interface JobData {
  email: EmailOptions;
  notification: {
    userId: string;
    type: NotificationType;
    data: Record<string, any>;
  };
  'document-processing': {
    documentId: string;
    operation: 'index' | 'analyze' | 'convert';
    metadata?: Record<string, any>;
  };
  analytics: {
    type: 'track-event';
    data: AnalyticsEvent;
  };
  cleanup: {
    type: 'old-documents' | 'expired-sessions' | 'failed-jobs';
    olderThan: number; // days
  };
}

export interface JobResult {
  email: {
    sent: boolean;
    error?: string;
  };
  notification: {
    delivered: boolean;
    channels: string[];
  };
  'document-processing': {
    success: boolean;
    output?: string;
    error?: string;
  };
  analytics: {
    processed: boolean;
    timestamp: string;
  };
  cleanup: {
    deletedCount: number;
    errors?: string[];
  };
}

export interface JobStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

export type JobStatus = 
  | 'added'
  | 'completed'
  | 'failed'
  | 'delayed'
  | 'active'
  | 'waiting';

export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  timeout?: number;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
  jobId?: string;
}

export type QueueName = 
  | 'email'
  | 'notification'
  | 'document-processing'
  | 'export';

export interface QueueJob<T = any> {
  queue: QueueName;
  data: T;
  options?: JobOptions;
}

export interface QueueMetrics {
  timestamp: Date;
  queues: Record<QueueName, {
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    waiting: number;
  }>;
}

export interface JobMetrics {
  id: string;
  queue: QueueName;
  status: JobStatus;
  duration?: number;
  attempts: number;
  error?: string;
  timestamp: Date;
}

export interface QueueStats {
  totalJobs: number;
  processedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  jobsByQueue: Record<QueueName, {
    total: number;
    processed: number;
    failed: number;
  }>;
}

export interface RetryOptions {
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: boolean;
  priority?: number;
} 