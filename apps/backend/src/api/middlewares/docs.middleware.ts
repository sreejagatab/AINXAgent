import { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../../docs/swagger';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';

const monitor = PerformanceMonitor.getInstance('DocsMiddleware');

export const setupDocs = (app: any) => {
  // Serve swagger docs
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Enhanced AI Agent API Documentation',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
      },
    })
  );

  // Serve swagger spec
  app.get('/api/docs.json', (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
      monitor.recordMetric('swagger_spec_served', Date.now() - startTime);
    } catch (error) {
      monitor.recordError('swagger_spec_serve_failed', error as Error);
      res.status(500).send({ error: 'Failed to serve API documentation' });
    }
  });
}; 