import { Router } from 'express';
import { documentationController } from '../controllers/documentation.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { cache } from '../middleware/cache';
import { performanceLogger } from '../middleware/logging';
import {
  createDocumentSchema,
  updateDocumentSchema,
  reorderPagesSchema,
} from '../validators/documentation.validator';
import { serveApiDocs } from '../middleware/documentation';
import { auth, requireRoles } from '../middleware/auth';
import { rateLimiter } from '../middleware/rate-limit';

const router = Router();

// Public routes
router.get(
  '/pages',
  cache(300), // 5 minutes
  performanceLogger('Get All Pages'),
  documentationController.getAllPages
);

router.get(
  '/pages/:id',
  cache(300),
  performanceLogger('Get Page'),
  documentationController.getPage
);

router.get(
  '/search',
  performanceLogger('Search Documentation'),
  documentationController.search
);

router.get(
  '/toc',
  cache(300),
  documentationController.getTableOfContents
);

// Protected routes
router.post(
  '/pages',
  authenticate,
  authorize('EDITOR', 'ADMIN'),
  validateRequest(createDocumentSchema),
  performanceLogger('Create Page'),
  documentationController.createPage
);

router.put(
  '/pages/:id',
  authenticate,
  authorize('EDITOR', 'ADMIN'),
  validateRequest(updateDocumentSchema),
  performanceLogger('Update Page'),
  documentationController.updatePage
);

router.delete(
  '/pages/:id',
  authenticate,
  authorize('ADMIN'),
  performanceLogger('Delete Page'),
  documentationController.deletePage
);

router.post(
  '/pages/reorder',
  authenticate,
  authorize('EDITOR', 'ADMIN'),
  validateRequest(reorderPagesSchema),
  documentationController.reorderPages
);

// Serve OpenAPI documentation
router.get(
  '/',
  auth,
  requireRoles(['ADMIN']),
  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
  }),
  cache({ duration: 3600 }), // Cache for 1 hour
  serveApiDocs
);

// Serve Swagger UI
router.get(
  '/ui',
  auth,
  requireRoles(['ADMIN']),
  rateLimiter({
    windowMs: 60 * 1000,
    max: 30,
  }),
  (req, res) => {
    res.render('swagger', {
      title: 'API Documentation',
      specUrl: '/api/docs',
    });
  }
);

export { router as documentationRouter }; 