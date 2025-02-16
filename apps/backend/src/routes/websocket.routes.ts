import { Router } from 'express';
import { websocketController } from '../controllers/websocket.controller';
import { auth, requireRoles } from '../middleware/auth';
import { rateLimiter } from '../middleware/rate-limit';
import { validate } from '../middleware/validation';
import { broadcastSchema } from '../validators/websocket.validator';

const router = Router();

// All WebSocket routes require authentication
router.use(auth);

// Get connected clients (Admin only)
router.get(
  '/clients',
  requireRoles(['ADMIN']),
  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
  }),
  websocketController.getConnectedClients
);

// Broadcast message (Admin only)
router.post(
  '/broadcast',
  requireRoles(['ADMIN']),
  rateLimiter({
    windowMs: 60 * 1000,
    max: 10,
  }),
  validate(broadcastSchema),
  websocketController.broadcastMessage
);

// Get room members
router.get(
  '/rooms/:room/members',
  rateLimiter({
    windowMs: 60 * 1000,
    max: 30,
  }),
  websocketController.getRoomMembers
);

export { router as websocketRouter }; 