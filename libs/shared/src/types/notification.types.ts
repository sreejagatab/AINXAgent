export type NotificationType =
  | 'prompt_execution'
  | 'system_alert'
  | 'account_update'
  | 'security_alert'
  | 'subscription_update';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface EmailOptions {
  to: string;
  template: EmailTemplate;
  subject: string;
  data: Record<string, any>;
}

export type EmailTemplate =
  | 'welcome'
  | 'reset-password'
  | 'verify-email'
  | 'prompt-execution'
  | 'account-locked';

export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
} 