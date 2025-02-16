import { Router } from 'express';
import { promptController } from '../controllers/prompt.controller';
import { authenticate } from '../middleware/auth';
import { validateContent } from '../middleware/security';

const router = Router();

// Apply middleware
router.use(authenticate);
router.use(validateContent);

// Routes
router.post('/', promptController.createTemplate);
router.get('/', promptController.getTemplates);
router.get('/:id', promptController.getTemplateById);
router.put('/:id', promptController.updateTemplate);
router.delete('/:id', promptController.deleteTemplate);
router.get('/:id/versions', promptController.getTemplateVersions);
router.post('/:id/evaluate', promptController.evaluateTemplate);
router.get('/categories', promptController.getCategories);
router.get('/search', promptController.searchTemplates);

export const promptRouter = router; 