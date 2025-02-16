export type NotificationType =
  | 'DOCUMENT_SHARED'
  | 'COMMENT_ADDED'
  | 'MENTION'
  | 'TEAM_INVITE'
  | 'SYSTEM_UPDATE'
  | 'TASK_ASSIGNED'
  | 'DOCUMENT_UPDATED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    [K in NotificationType]: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  link?: string;
  data?: Record<string, any>;
}

export interface NotificationStats {
  totalUnread: number;
  byType: Record<NotificationType, number>;
  lastRead?: Date;
} 