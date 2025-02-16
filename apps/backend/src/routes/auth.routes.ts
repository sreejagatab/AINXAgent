import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { rateLimiter } from '../middleware/rate-limit';
import { validate } from '../middleware/validation';
import { auth } from '../middleware/auth';

const router = Router();

// Rate limiting configuration
const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
});

const registerLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: 'Too many registration attempts, please try again later',
});

// Public routes
router.post(
  '/register',
  registerLimiter,
  authController.register
);

router.post(
  '/login',
  loginLimiter,
  authController.login
);

router.post(
  '/reset-password',
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 3 }),
  authController.resetPassword
);

// Protected routes
router.post(
  '/logout',
  auth,
  authController.logout
);

router.get(
  '/verify',
  auth,
  authController.verifyToken
);

router.post(
  '/change-password',
  auth,
  authController.changePassword
);

export { router as authRouter }; 