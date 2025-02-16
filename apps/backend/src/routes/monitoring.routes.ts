import { Router } from 'express';
import { monitoringController } from '../controllers/monitoring.controller';
import { auth, requireRoles } from '../middleware/auth';
import { rateLimiter } from '../middleware/rate-limit';
import { cache } from '../middleware/cache';

const router = Router();

// Public health check endpoint
router.get(
  '/health',
  cache({ duration: 30 }), // Cache for 30 seconds
  monitoringController.getHealth
);

// Protected routes - Admin only
router.use(auth, requireRoles(['ADMIN']));

// System metrics
router.get(
  '/metrics',
  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
  }),
  monitoringController.getMetrics
);

// System logs
router.get(
  '/logs',
  rateLimiter({
    windowMs: 60 * 1000,
    max: 30,
  }),
  monitoringController.getLogs
);

// Error statistics
router.get(
  '/errors',
  rateLimiter({
    windowMs: 60 * 1000,
    max: 30,
  }),
  monitoringController.getErrorStats
);

export { router as monitoringRouter }; 