import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { performance } from 'perf_hooks';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Add request ID
  req.id = req.headers['x-request-id'] || generateRequestId();
  
  // Start timer
  const start = performance.now();

  // Log request
  logger.info('Incoming request', {
    id: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });

  // Log response
  res.on('finish', () => {
    const duration = Math.round(performance.now() - start);
    const level = res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]('Request completed', {
      id: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
    });
  });

  next();
}

export function performanceLogger(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();

  res.on('finish', () => {
    const duration = Math.round(performance.now() - start);
    
    if (duration > 1000) { // Log slow requests (>1s)
      logger.warn('Slow request detected', {
        id: req.id,
        method: req.method,
        path: req.path,
        duration,
        userId: req.user?.id,
      });
    }

    // Track performance metrics
    trackRequestMetrics(req, duration);
  });

  next();
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function trackRequestMetrics(req: Request, duration: number) {
  try {
    // Implement metric tracking (e.g., Prometheus, StatsD)
    // This is a placeholder for actual implementation
    const tags = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
    };

    metrics.timing('request.duration', duration, tags);
    metrics.increment('request.count', 1, tags);
  } catch (error) {
    logger.error('Error tracking metrics:', error);
  }
} 