import { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthProvider';
import { config } from '../config';

interface WebSocketContextType {
  socket: Socket | null;
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const socketRef = useRef<Socket | null>(null);
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && token) {
      socketRef.current = io(config.wsUrl, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected');
      });

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      socketRef.current.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [token, isLoading]);

  const subscribe = (event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
  };

  const unsubscribe = (event: string, callback: (data: any) => void) => {
    socketRef.current?.off(event, callback);
  };

  const emit = (event: string, data: any) => {
    socketRef.current?.emit(event, data);
  };

  const value = {
    socket: socketRef.current,
    subscribe,
    unsubscribe,
    emit,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
} 