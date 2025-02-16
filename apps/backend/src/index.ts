import express from 'express';
import { configureSecurityMiddleware } from './api/middlewares/security';
import { errorHandler } from './api/middlewares/error-handler';
import { requestLogger } from './api/middlewares/logger';
import routes from './api/routes';
import { RedisService } from './services/redis.service';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = process.env.PORT || 4000;

// Initialize services
const prisma = new PrismaClient();
const redis = RedisService.getInstance();

// Configure middleware
configureSecurityMiddleware(app);
app.use(requestLogger);

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  
  try {
    await redis.disconnect();
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { app, server }; 