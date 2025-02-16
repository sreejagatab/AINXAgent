import { Router } from 'express';
import { authRouter } from './auth.routes';
import { documentationRouter } from './documentation.routes';
import { aiRouter } from './ai.routes';
import { searchRouter } from './search.routes';
import { userRouter } from './user.routes';
import { authenticate } from '../middleware/auth';
import { cache } from '../middleware/cache';
import { rateLimiter } from '../middleware/rate-limit';

const router = Router();

// Public routes
router.use('/auth', rateLimiter(), authRouter);
router.use('/docs', cache(), documentationRouter);
router.use('/search', rateLimiter(), searchRouter);

// Protected routes
router.use('/ai', authenticate, rateLimiter({ max: 50 }), aiRouter);
router.use('/users', authenticate, userRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { router as apiRouter }; 