import type { Job } from 'bull';
import { emailService } from '../services/email.service';
import { notificationService } from '../services/notification.service';
import { documentService } from '../services/document.service';
import { analyticsService } from '../services/analytics.service';
import { logger } from '../utils/logger';
import type { JobData, JobResult } from '../types/queue.types';

export const emailProcessor = async (
  job: Job<JobData['email']>
): Promise<JobResult['email']> => {
  try {
    await emailService.sendEmail(job.data);
    return { sent: true };
  } catch (error) {
    logger.error('Email job failed:', error);
    return { sent: false, error: error.message };
  }
};

export const notificationProcessor = async (
  job: Job<JobData['notification']>
): Promise<JobResult['notification']> => {
  try {
    const { userId, type, data } = job.data;
    await notificationService.createNotification(userId, type, data);
    return { delivered: true, channels: ['in-app', 'websocket'] };
  } catch (error) {
    logger.error('Notification job failed:', error);
    throw error;
  }
};

export const documentProcessor = async (
  job: Job<JobData['document-processing']>
): Promise<JobResult['document-processing']> => {
  try {
    const { documentId, operation, metadata } = job.data;

    switch (operation) {
      case 'index':
        await documentService.indexDocument(documentId);
        break;
      case 'analyze':
        await documentService.analyzeDocument(documentId, metadata);
        break;
      case 'convert':
        await documentService.convertDocument(documentId, metadata);
        break;
    }

    return { success: true };
  } catch (error) {
    logger.error('Document processing job failed:', error);
    return { success: false, error: error.message };
  }
};

export const analyticsProcessor = async (
  job: Job<JobData['analytics']>
): Promise<JobResult['analytics']> => {
  try {
    const { type, data } = job.data;
    
    if (type === 'track-event') {
      await analyticsService.trackEvent(data);
    }

    return {
      processed: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Analytics job failed:', error);
    throw error;
  }
};

export const cleanupProcessor = async (
  job: Job<JobData['cleanup']>
): Promise<JobResult['cleanup']> => {
  try {
    const { type, olderThan } = job.data;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThan);

    let deletedCount = 0;
    const errors: string[] = [];

    switch (type) {
      case 'old-documents':
        deletedCount = await documentService.deleteOldDocuments(cutoffDate);
        break;
      case 'expired-sessions':
        deletedCount = await prisma.session.deleteMany({
          where: {
            expiresAt: {
              lt: new Date(),
            },
          },
        });
        break;
      case 'failed-jobs':
        // Implement failed jobs cleanup
        break;
    }

    return { deletedCount, errors: errors.length ? errors : undefined };
  } catch (error) {
    logger.error('Cleanup job failed:', error);
    throw error;
  }
}; 