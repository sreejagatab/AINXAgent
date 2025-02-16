import { useEffect, useCallback, useRef } from 'react';
import { websocketService } from '../services/websocket.service';
import { useAuth } from './useAuth';
import { logger } from '../utils/logger';

export function useWebSocket<T>(channel: string, handler: (data: T) => void) {
  const { isAuthenticated } = useAuth();
  const handlerRef = useRef(handler);

  // Update handler ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  // Memoize the wrapped handler
  const wrappedHandler = useCallback((data: T) => {
    try {
      handlerRef.current(data);
    } catch (error) {
      logger.error('WebSocket handler error', { error, channel, data });
    }
  }, [channel]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect to WebSocket
    websocketService.connect();

    // Subscribe to channel
    const unsubscribe = websocketService.subscribe<T>(channel, wrappedHandler);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [channel, wrappedHandler, isAuthenticated]);

  const send = useCallback((type: string, payload: any) => {
    websocketService.send(type, payload);
  }, []);

  return { send };
} 