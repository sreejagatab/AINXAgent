import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { webSocketServer } from '../websocket/server';
import { logger } from '../utils/logger';
import type { Notification, NotificationType } from '../types/notification.types';

export class NotificationService {
  private static instance: NotificationService;
  private readonly CACHE_PREFIX = 'notifications:';
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async createNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any>
  ): Promise<Notification> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          data,
          read: false,
        },
      });

      // Send real-time notification
      await webSocketServer.emitToUser(userId, 'notification:new', notification);

      // Clear user's notification cache
      await this.clearUserCache(userId);

      return notification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  public async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${userId}:${page}:${limit}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.notification.count({
          where: { userId },
        }),
      ]);

      const result = { notifications, total };
      await redis.set(
        cacheKey,
        JSON.stringify(result),
        'EX',
        this.CACHE_TTL
      );

      return result;
    } catch (error) {
      logger.error('Failed to get user notifications:', error);
      throw error;
    }
  }

  public async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId,
        },
        data: { read: true },
      });

      // Clear user's notification cache
      await this.clearUserCache(userId);

      // Send real-time update
      await webSocketServer.emitToUser(userId, 'notification:read', {
        notificationId,
      });
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  public async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: { read: true },
      });

      // Clear user's notification cache
      await this.clearUserCache(userId);

      // Send real-time update
      await webSocketServer.emitToUser(userId, 'notification:all-read', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  private async clearUserCache(userId: string): Promise<void> {
    const pattern = `${this.CACHE_PREFIX}${userId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await redis.del(keys);
    }
  }
}

export const notificationService = NotificationService.getInstance(); 