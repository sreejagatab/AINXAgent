import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import * as path from 'path';
import * as fs from 'fs';
import { authenticate } from '../middleware/auth';
import { config } from '../config';

const router = Router();

// Load OpenAPI specification
const openApiPath = path.join(__dirname, '../../docs/openapi.yaml');
const openApiSpec = fs.readFileSync(openApiPath, 'utf8');

// Configure Swagger UI
const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AINXAgent API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

// Serve documentation only in non-production environments
if (config.env !== 'production') {
  router.use('/', swaggerUi.serve);
  router.get('/', swaggerUi.setup(openApiSpec, swaggerUiOptions));
} else {
  // In production, require authentication
  router.use(authenticate);
  router.use('/', swaggerUi.serve);
  router.get('/', swaggerUi.setup(openApiSpec, swaggerUiOptions));
}

export const docsRouter = router; 