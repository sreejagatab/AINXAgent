import type {
  User,
  Document,
  Notification,
  SearchMetrics,
  EmailMetrics,
  WebsocketMetrics,
  Role,
  Prisma,
} from '@prisma/client';

export type {
  User,
  Document,
  Notification,
  SearchMetrics,
  EmailMetrics,
  WebsocketMetrics,
  Role,
};

export type UserWithoutPassword = Omit<User, 'password'>;

export type DocumentWithAuthor = Document & {
  author: UserWithoutPassword;
};

export type NotificationWithUser = Notification & {
  user: UserWithoutPassword;
};

export type DatabaseError = {
  code: string;
  message: string;
  meta?: Record<string, any>;
};

export type TransactionClient = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

export type BatchPayload = Prisma.BatchPayload;

export interface DatabaseMetrics {
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }>;
  errorRate: number;
  connectionPool: {
    total: number;
    active: number;
    idle: number;
    waiting: number;
  };
} 