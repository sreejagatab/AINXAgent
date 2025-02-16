import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const monitor = PerformanceMonitor.getInstance('RequestLogger');

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: (req as any).user?.id,
    };

    monitor.recordMetric('request_duration', duration);

    if (res.statusCode >= 400) {
      logger.error('Request failed', logData);
      monitor.recordError('request_error', new Error(`HTTP ${res.statusCode}`));
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

export const logger as winston.Logger = logger; 