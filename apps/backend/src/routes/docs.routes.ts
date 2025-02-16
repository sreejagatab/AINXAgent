import { Router } from 'express';
import { apiDocsGenerator } from '../utils/docs.generator';
import { cache } from '../middleware/cache';
import { rateLimiter } from '../middleware/rate-limit';
import swaggerUi from 'swagger-ui-express';

const router = Router();

// Serve API documentation UI
router.use(
  '/',
  rateLimiter({ windowMs: 60000, max: 100 }), // 100 requests per minute
  cache(3600), // Cache for 1 hour
  async (req, res, next) => {
    try {
      const spec = await apiDocsGenerator.generateDocs(req.app._router);
      swaggerUi.setup(spec)(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// Serve raw OpenAPI spec
router.get(
  '/spec',
  rateLimiter({ windowMs: 60000, max: 50 }), // 50 requests per minute
  cache(3600),
  async (req, res, next) => {
    try {
      const spec = await apiDocsGenerator.generateDocs(req.app._router);
      res.json(spec);
    } catch (error) {
      next(error);
    }
  }
);

export { router as docsRouter }; 