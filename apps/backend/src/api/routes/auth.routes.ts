import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateLogin, validateRegister } from '../validators/auth.validator';
import { rateLimiter } from '../middlewares/rate-limiter';
import { asyncHandler } from '../middlewares/async-handler';

const router = Router();
const authController = new AuthController();

// Apply stricter rate limiting for auth routes
const authRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5 // limit each IP to 5 requests per hour
});

router.post('/login',
  authRateLimiter,
  validateLogin,
  asyncHandler(authController.login)
);

router.post('/register',
  authRateLimiter,
  validateRegister,
  asyncHandler(authController.register)
);

router.post('/refresh-token',
  asyncHandler(authController.refreshToken)
);

router.post('/logout',
  asyncHandler(authController.logout)
);

router.post('/forgot-password',
  authRateLimiter,
  asyncHandler(authController.forgotPassword)
);

router.post('/reset-password',
  authRateLimiter,
  asyncHandler(authController.resetPassword)
);

export default router; 