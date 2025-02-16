import { Middleware } from '@reduxjs/toolkit';
import { websocketService } from '../services/websocket.service';
import { logger } from '../utils/logger';

// Action types that should be forwarded to WebSocket
const WS_FORWARD_ACTIONS = [
  'chat/sendMessage',
  'notification/markAsRead',
  'presence/updateStatus',
];

export const websocketMiddleware: Middleware = () => (next) => (action) => {
  // Forward specific actions to WebSocket
  if (WS_FORWARD_ACTIONS.includes(action.type)) {
    try {
      websocketService.send(action.type, action.payload);
    } catch (error) {
      logger.error('Failed to forward action to WebSocket', {
        error,
        type: action.type,
        payload: action.payload,
      });
    }
  }

  // Handle WebSocket-specific actions
  if (action.type === 'ws/connect') {
    websocketService.connect();
  } else if (action.type === 'ws/disconnect') {
    websocketService.disconnect();
  }

  return next(action);
}; 