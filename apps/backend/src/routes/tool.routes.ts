import { Router } from 'express';
import { toolController } from '../controllers/tool.controller';
import { authenticate } from '../middleware/auth';
import { validateContent } from '../middleware/security';

const router = Router();

// Apply middleware
router.use(authenticate);
router.use(validateContent);

// Routes
router.post('/', toolController.createTool);
router.get('/', toolController.getTools);
router.get('/:id', toolController.getToolById);
router.put('/:id', toolController.updateTool);
router.delete('/:id', toolController.deleteTool);
router.post('/:id/execute', toolController.executeTool);
router.get('/:id/executions', toolController.getToolExecutions);
router.get('/types', toolController.getToolTypes);
router.get('/search', toolController.searchTools);

export const toolRouter = router; 