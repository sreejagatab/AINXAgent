export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
}

export interface WebSocketError {
  code: number;
  message: string;
  details?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  attachments?: Array<{
    id: string;
    type: 'image' | 'file';
    url: string;
  }>;
}

export interface PresenceStatus {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface WebSocketState {
  connected: boolean;
  lastPing?: number;
  reconnectAttempts: number;
  subscriptions: string[];
}

export type WebSocketEventHandler<T> = (data: T) => void | Promise<void>;

export interface WebSocketSubscription {
  channel: string;
  handler: WebSocketEventHandler<any>;
} 