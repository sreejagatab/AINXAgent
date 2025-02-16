export type EmailTemplate = 
  | 'welcome'
  | 'password-reset'
  | 'document-share'
  | 'verification'
  | 'team-invite'
  | 'comment-notification';

export interface EmailOptions {
  to: string;
  template: EmailTemplate;
  subject: string;
  data: Record<string, any>;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailLog {
  id: string;
  to: string;
  template: EmailTemplate;
  subject: string;
  status: 'sent' | 'failed';
  error?: string;
  metadata?: Record<string, any>;
  sentAt: Date;
}

export interface EmailStats {
  totalSent: number;
  failureRate: number;
  averageDeliveryTime: number;
  templateUsage: Record<EmailTemplate, number>;
} 