import { Router } from 'express';
import { register } from 'prom-client';
import { authorize } from '../middlewares/auth';
import { MonitoringService } from '@enhanced-ai-agent/shared';

const router = Router();
const monitoring = MonitoringService.getInstance();

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get application metrics
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prometheus metrics
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get(
  '/metrics',
  authorize('ADMIN'),
  async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      monitoring.logError('Failed to collect metrics', error as Error);
      res.status(500).send('Error collecting metrics');
    }
  }
);

/**
 * @swagger
 * /api/metrics/health:
 *   get:
 *     summary: Get application health status
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Health check response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                     total:
 *                       type: number
 */
router.get('/metrics/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    uptime: process.uptime(),
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal,
    },
    timestamp: new Date().toISOString(),
  };

  res.json(healthData);
});

export default router; 