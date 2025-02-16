import type { User } from '@prisma/client';

export interface SocketUser {
  id: string;
  name: string;
  role: string;
}

export interface DocumentUpdate {
  documentId: string;
  changes: {
    type: 'insert' | 'delete' | 'replace';
    position: number;
    content?: string;
    length?: number;
  }[];
  version: number;
}

export interface UserPresence {
  userId: string;
  name: string;
  documentId: string;
  lastActive: Date;
  status: 'active' | 'idle' | 'offline';
}

export type SocketEvent =
  | 'document:updated'
  | 'document:error'
  | 'user:joined'
  | 'user:left'
  | 'notification:new'
  | 'notification:read'
  | 'error';

export interface SocketError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

export interface SocketMessage {
  type: SocketEvent;
  payload: any;
  timestamp: string;
}

export interface SocketRoom {
  id: string;
  type: 'user' | 'document' | 'global';
  members: string[];
}

export interface SocketStats {
  connectedUsers: number;
  activeDocuments: number;
  messageCount: number;
  uptime: number;
} 