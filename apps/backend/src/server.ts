import { app } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './lib/prisma';
import { cache } from './lib/redis';
import { initializeVectorStore } from './services/vector-store.service';

async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('Connected to database');

    // Test Redis connection
    await cache.ping();
    logger.info('Connected to Redis');

    // Initialize vector store
    await initializeVectorStore();
    logger.info('Vector store initialized');

    // Start server
    const server = app.listen(config.PORT, () => {
      logger.info(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');

      server.close(async () => {
        try {
          await prisma.$disconnect();
          await cache.quit();
          logger.info('Server shutdown complete');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 