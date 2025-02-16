import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { auth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rate-limit';
import { validate } from '../middleware/validation';
import { upload } from '../middleware/upload';
import { 
  createDocumentSchema, 
  updateDocumentSchema 
} from '../validators/document.validator';

const router = Router();

// Rate limiting configuration
const documentLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many document requests, please try again later',
});

// All document routes require authentication
router.use(auth);

// Create document
router.post(
  '/',
  documentLimiter,
  validate(createDocumentSchema),
  documentController.createDocument
);

// Update document
router.put(
  '/:id',
  documentLimiter,
  validate(updateDocumentSchema),
  documentController.updateDocument
);

// Get document
router.get(
  '/:id',
  documentLimiter,
  documentController.getDocument
);

// Delete document
router.delete(
  '/:id',
  documentLimiter,
  documentController.deleteDocument
);

// Search documents
router.get(
  '/search',
  documentLimiter,
  documentController.searchDocuments
);

// Upload attachment
router.post(
  '/:documentId/attachments',
  documentLimiter,
  upload.single('file'),
  documentController.uploadAttachment
);

// Get attachments
router.get(
  '/:documentId/attachments',
  documentLimiter,
  documentController.getAttachments
);

export { router as documentRouter }; 