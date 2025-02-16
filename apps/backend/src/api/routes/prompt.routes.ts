import { Router } from 'express';
import { PromptController } from '../controllers/prompt.controller';
import { authenticate } from '../middlewares/auth';
import { rateLimiter } from '../middlewares/rate-limiter';

const router = Router();

/**
 * @swagger
 * /api/prompts:
 *   post:
 *     summary: Create a new prompt
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromptCreate'
 *     responses:
 *       201:
 *         description: Prompt created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PromptResponse'
 */
router.post('/', authenticate, PromptController.createPrompt);

/**
 * @swagger
 * /api/prompts/{id}/execute:
 *   post:
 *     summary: Execute a prompt
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromptExecution'
 *     responses:
 *       200:
 *         description: Prompt executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExecutionResponse'
 */
router.post(
  '/:id/execute',
  authenticate,
  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
  }),
  PromptController.executePrompt
);

// Additional routes for CRUD operations
router.get('/history', authenticate, PromptController.getPromptHistory);
router.put('/:id', authenticate, PromptController.updatePrompt);
router.delete('/:id', authenticate, PromptController.deletePrompt);

export default router; 