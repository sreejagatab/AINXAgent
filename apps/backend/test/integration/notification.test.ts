import { request, createTestUser, generateAuthToken } from '../helpers';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../../src/services/notification.service';
import { WebSocketService } from '../../src/services/websocket.service';

const prisma = new PrismaClient();
const notificationService = NotificationService.getInstance();

jest.mock('../../src/services/websocket.service');

describe('Notification API', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const user = await createTestUser({
      email: 'test@example.com',
      username: 'testuser',
    });
    userId = user.id;
    authToken = await generateAuthToken(userId);
  });

  describe('GET /api/notifications', () => {
    it('should return user notifications', async () => {
      // Create test notifications
      await notificationService.sendNotification({
        userId,
        type: 'system_alert',
        title: 'Test Notification',
        message: 'This is a test notification',
        priority: 'normal',
      });

      const response = await request
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        type: 'system_alert',
        title: 'Test Notification',
        read: false,
      });
    });

    it('should support pagination', async () => {
      // Create multiple notifications
      const notifications = Array(5).fill(null).map((_, i) => 
        notificationService.sendNotification({
          userId,
          type: 'system_alert',
          title: `Test ${i + 1}`,
          message: `Test message ${i + 1}`,
          priority: 'normal',
        })
      );
      await Promise.all(notifications);

      const response = await request
        .get('/api/notifications')
        .query({ limit: 3, page: 1 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 3,
        total: 5,
      });
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: 'system_alert',
          title: 'Test',
          message: 'Test message',
          priority: 'normal',
          read: false,
        },
      });

      const response = await request
        .put(`/api/notifications/${notification.id}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updated = await prisma.notification.findUnique({
        where: { id: notification.id },
      });
      expect(updated?.read).toBe(true);
      expect(updated?.readAt).toBeDefined();
    });
  });

  describe('WebSocket notifications', () => {
    it('should send real-time notifications', async () => {
      const mockSendToUser = jest.spyOn(WebSocketService.prototype, 'sendToUser');

      await notificationService.sendNotification({
        userId,
        type: 'system_alert',
        title: 'Real-time Test',
        message: 'This should be sent via WebSocket',
      });

      expect(mockSendToUser).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          type: 'notification',
          data: expect.objectContaining({
            title: 'Real-time Test',
          }),
        })
      );
    });
  });
}); 