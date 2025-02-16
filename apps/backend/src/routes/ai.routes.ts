import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { auth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rate-limit';
import { validate } from '../middleware/validation';
import { completionRequestSchema } from '../validators/ai.validator';

const router = Router();

// Rate limiting configuration
const aiLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Too many AI requests, please try again later',
});

// All AI routes require authentication
router.use(auth);

// Regular completion endpoint
router.post(
  '/completion',
  aiLimiter,
  validate(completionRequestSchema),
  aiController.generateCompletion
);

// Streaming completion endpoint
router.post(
  '/completion/stream',
  aiLimiter,
  validate(completionRequestSchema),
  aiController.streamCompletion
);

// Document analysis endpoint
router.post(
  '/analyze/:documentId',
  aiLimiter,
  aiController.analyzeDocument
);

// Text summarization endpoint
router.post(
  '/summarize',
  aiLimiter,
  aiController.generateSummary
);

export { router as aiRouter }; 