import { Router } from 'express';
import authRoutes from './auth.routes';
import promptRoutes from './prompt.routes';
import userRoutes from './user.routes';
import blogRoutes from './blog.routes';
import { authenticate } from '../middlewares/auth';
import { rateLimiter } from '../middlewares/rate-limiter';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API version prefix
router.use('/v1', rateLimiter, (req, res, next) => {
  res.setHeader('X-API-Version', 'v1');
  next();
});

// Public routes
router.use('/v1/auth', authRoutes);

// Protected routes
router.use('/v1/prompts', authenticate, promptRoutes);
router.use('/v1/users', authenticate, userRoutes);
router.use('/v1/blog', authenticate, blogRoutes);

export default router; 