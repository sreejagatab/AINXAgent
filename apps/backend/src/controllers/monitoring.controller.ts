import { Request, Response, NextFunction } from 'express';
import { monitoringService } from '../services/monitoring.service';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';

export class MonitoringController {
  public async getHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await monitoringService.getSystemHealth();
      res.json(health);
    } catch (error) {
      next(error);
    }
  }

  public async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.role.includes('ADMIN')) {
        throw ApiError.forbidden('Not authorized to view metrics');
      }

      const { startDate, endDate } = req.query;
      const metrics = await monitoringService.getMetrics(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(metrics);
    } catch (error) {
      next(error);
    }
  }

  public async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.role.includes('ADMIN')) {
        throw ApiError.forbidden('Not authorized to view logs');
      }

      const { level, limit, offset } = req.query;
      const logs = await monitoringService.getLogs({
        level: level as string,
        limit: Number(limit) || 100,
        offset: Number(offset) || 0,
      });

      res.json(logs);
    } catch (error) {
      next(error);
    }
  }

  public async getErrorStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.role.includes('ADMIN')) {
        throw ApiError.forbidden('Not authorized to view error stats');
      }

      const stats = await monitoringService.getErrorStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export const monitoringController = new MonitoringController(); 