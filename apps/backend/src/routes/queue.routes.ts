import { Router } from 'express';
import { queueController } from '../controllers/queue.controller';
import { auth, requireRoles } from '../middleware/auth';
import { rateLimiter } from '../middleware/rate-limit';
import { validate } from '../middleware/validation';
import { queueJobSchema } from '../validators/queue.validator';

const router = Router();

// All queue routes require admin authentication
router.use(auth, requireRoles(['ADMIN']));

// Add job to queue
router.post(
  '/jobs',
  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
  }),
  validate(queueJobSchema),
  queueController.addJob
);

// Get queue status
router.get(
  '/:queue/status',
  rateLimiter({
    windowMs: 60 * 1000,
    max: 60,
  }),
  queueController.getQueueStatus
);

// Get job status
router.get(
  '/:queue/jobs/:jobId',
  rateLimiter({
    windowMs: 60 * 1000,
    max: 60,
  }),
  queueController.getJobStatus
);

// Retry failed job
router.post(
  '/:queue/jobs/:jobId/retry',
  rateLimiter({
    windowMs: 60 * 1000,
    max: 10,
  }),
  queueController.retryJob
);

export { router as queueRouter }; 