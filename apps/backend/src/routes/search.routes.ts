import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { auth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rate-limit';
import { validate } from '../middleware/validation';
import { searchQuerySchema } from '../validators/search.validator';

const router = Router();

// Rate limiting configuration
const searchLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 searches per minute
  message: 'Too many search requests, please try again later',
});

// All search routes require authentication
router.use(auth);

// Search endpoint
router.get(
  '/',
  searchLimiter,
  validate(searchQuerySchema),
  searchController.search
);

// Search suggestions endpoint
router.get(
  '/suggestions',
  searchLimiter,
  searchController.getSuggestions
);

// Search stats endpoint
router.get(
  '/stats',
  searchLimiter,
  searchController.getStats
);

export { router as searchRouter }; 