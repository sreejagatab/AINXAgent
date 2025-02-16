import { logger } from '../utils/logger';
import { analyticsService } from './analytics.service';
import { getEnvironment } from '../config/environment';
import { store } from '../store';
import { apiRetry } from '../utils/apiRetry';

interface WebSocketConfig {
  reconnectAttempts: number;
  reconnectInterval: number;
  pingInterval: number;
  pongTimeout: number;
}

type MessageHandler = (data: any) => void;

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectCount = 0;
  private pingTimeout?: number;
  private pongTimeout?: number;
  private config: WebSocketConfig;

  private constructor() {
    this.config = {
      reconnectAttempts: 5,
      reconnectInterval: 1000,
      pingInterval: 30000,
      pongTimeout: 5000,
    };
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const wsUrl = getEnvironment().WS_URL;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = this.handleOpen.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
    this.socket.onmessage = this.handleMessage.bind(this);
    this.socket.onerror = this.handleError.bind(this);

    this.startPingPong();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.stopPingPong();
    this.messageHandlers.clear();
  }

  public subscribe<T>(channel: string, handler: (data: T) => void): () => void {
    if (!this.messageHandlers.has(channel)) {
      this.messageHandlers.set(channel, new Set());
    }

    const handlers = this.messageHandlers.get(channel)!;
    handlers.add(handler as MessageHandler);

    // Send subscription message to server
    this.send('subscribe', { channel });

    // Return unsubscribe function
    return () => {
      handlers.delete(handler as MessageHandler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(channel);
        this.send('unsubscribe', { channel });
      }
    };
  }

  public send(type: string, payload: any): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      logger.warn('WebSocket is not connected', { type, payload });
      return;
    }

    try {
      this.socket.send(JSON.stringify({ type, payload }));
    } catch (error) {
      logger.error('Failed to send WebSocket message', { error, type, payload });
    }
  }

  private handleOpen(event: Event): void {
    logger.info('WebSocket connected');
    this.reconnectCount = 0;
    
    // Authenticate the connection
    const token = store.getState().auth.token;
    if (token) {
      this.send('authenticate', { token });
    }

    analyticsService.trackEvent('websocket_connected');
  }

  private handleClose(event: CloseEvent): void {
    logger.warn('WebSocket disconnected', { code: event.code, reason: event.reason });
    this.stopPingPong();

    if (this.reconnectCount < this.config.reconnectAttempts) {
      this.reconnectCount++;
      setTimeout(() => this.connect(), this.config.reconnectInterval);
    } else {
      analyticsService.trackEvent('websocket_connection_failed', {
        attempts: this.reconnectCount,
      });
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const { type, payload } = JSON.parse(event.data);

      if (type === 'pong') {
        this.handlePong();
        return;
      }

      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(payload);
          } catch (error) {
            logger.error('WebSocket message handler failed', { error, type, payload });
          }
        });
      }
    } catch (error) {
      logger.error('Failed to process WebSocket message', { error, data: event.data });
    }
  }

  private handleError(event: Event): void {
    logger.error('WebSocket error', { event });
    analyticsService.trackEvent('websocket_error');
  }

  private startPingPong(): void {
    this.pingTimeout = window.setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
        
        this.pongTimeout = window.setTimeout(() => {
          logger.warn('WebSocket pong timeout');
          this.socket?.close();
        }, this.config.pongTimeout);
      }
    }, this.config.pingInterval);
  }

  private handlePong(): void {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = undefined;
    }
  }

  private stopPingPong(): void {
    if (this.pingTimeout) {
      clearInterval(this.pingTimeout);
      this.pingTimeout = undefined;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = undefined;
    }
  }
}

export const websocketService = WebSocketService.getInstance(); 