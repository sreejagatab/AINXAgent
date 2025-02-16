import type { Socket } from 'socket.io';
import { documentService } from '../services/document.service';
import { notificationService } from '../services/notification.service';
import { logger } from '../utils/logger';
import type { SocketUser, DocumentUpdate } from '../types/socket.types';

export class WebSocketHandlers {
  public static async handleDocumentUpdate(
    socket: Socket,
    data: DocumentUpdate
  ) {
    try {
      const user = socket.data.user as SocketUser;
      const { documentId, changes } = data;

      // Validate user's access to document
      const hasAccess = await documentService.checkUserAccess(
        user.id,
        documentId
      );

      if (!hasAccess) {
        socket.emit('error', {
          message: 'Access denied',
          code: 'FORBIDDEN',
        });
        return;
      }

      // Apply document changes
      await documentService.applyChanges(documentId, changes, user.id);

      // Broadcast changes to other users viewing the document
      socket.to(`document:${documentId}`).emit('document:updated', {
        documentId,
        changes,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });

      // Track document activity
      await documentService.trackActivity(documentId, {
        type: 'UPDATE',
        userId: user.id,
        changes,
      });
    } catch (error) {
      logger.error('Document update failed:', error);
      socket.emit('error', {
        message: 'Failed to update document',
        code: 'UPDATE_FAILED',
      });
    }
  }

  public static async handleUserPresence(
    socket: Socket,
    data: { documentId: string; action: 'join' | 'leave' }
  ) {
    try {
      const user = socket.data.user as SocketUser;
      const { documentId, action } = data;

      if (action === 'join') {
        await documentService.trackUserPresence(documentId, user.id, true);
        socket.to(`document:${documentId}`).emit('user:joined', {
          userId: user.id,
          name: user.name,
          timestamp: new Date().toISOString(),
        });
      } else {
        await documentService.trackUserPresence(documentId, user.id, false);
        socket.to(`document:${documentId}`).emit('user:left', {
          userId: user.id,
          name: user.name,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('Presence update failed:', error);
    }
  }

  public static async handleNotificationAck(
    socket: Socket,
    data: { notificationId: string }
  ) {
    try {
      const user = socket.data.user as SocketUser;
      await notificationService.markAsRead(data.notificationId, user.id);
    } catch (error) {
      logger.error('Notification acknowledgment failed:', error);
    }
  }
} 