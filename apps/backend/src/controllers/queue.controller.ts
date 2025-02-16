import { Request, Response, NextFunction } from 'express';
import { queueService } from '../services/queue.service';
import { validateQueueJob } from '../validators/queue.validator';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';

export class QueueController {
  public async addJob(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.role.includes('ADMIN')) {
        throw ApiError.forbidden('Not authorized to add jobs');
      }

      const { queue, data, options } = await validateQueueJob(req.body);
      const job = await queueService.addJob(queue, data, options);

      res.status(201).json({
        jobId: job.id,
        status: 'queued',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getQueueStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.role.includes('ADMIN')) {
        throw ApiError.forbidden('Not authorized to view queue status');
      }

      const { queue } = req.params;
      const status = await queueService.getQueueStatus(queue);

      res.json(status);
    } catch (error) {
      next(error);
    }
  }

  public async getJobStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.role.includes('ADMIN')) {
        throw ApiError.forbidden('Not authorized to view job status');
      }

      const { queue, jobId } = req.params;
      const status = await queueService.getJobStatus(queue, jobId);

      if (!status) {
        throw ApiError.notFound('Job not found');
      }

      res.json(status);
    } catch (error) {
      next(error);
    }
  }

  public async retryJob(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.role.includes('ADMIN')) {
        throw ApiError.forbidden('Not authorized to retry jobs');
      }

      const { queue, jobId } = req.params;
      await queueService.retryJob(queue, jobId);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

export const queueController = new QueueController(); 