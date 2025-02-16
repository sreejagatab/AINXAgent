import { Request, Response, NextFunction } from 'express';
import { MonitoringService } from '@enhanced-ai-agent/shared';
import { v4 as uuidv4 } from 'uuid';

const monitoring = MonitoringService.getInstance();

export const monitorRequest = (req: Request, res: Response, next: NextFunction) => {
  req.startTime = Date.now();
  req.requestId = uuidv4();

  // Log request
  monitoring.logInfo('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response metrics
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || 0);
    const route = req.route ? req.route.path : req.path;

    monitoring.recordRequestMetrics(
      req.method,
      route,
      res.statusCode,
      duration
    );

    // Log response
    monitoring.logInfo('Request completed', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
};

export const errorMonitoring = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  monitoring.logError('Request error', error, {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
  });

  next(error);
}; 