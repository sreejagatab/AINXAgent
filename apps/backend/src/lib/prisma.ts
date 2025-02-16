import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log database events
prisma.$on('query', (e: any) => {
  logger.debug('Query:', {
    query: e.query,
    params: e.params,
    duration: e.duration,
  });
});

prisma.$on('error', (e: any) => {
  logger.error('Database error:', e);
});

prisma.$on('info', (e: any) => {
  logger.info('Database info:', e);
});

prisma.$on('warn', (e: any) => {
  logger.warn('Database warning:', e);
});

// Handle connection errors
prisma.$connect()
  .then(() => {
    logger.info('Connected to database');
  })
  .catch((error) => {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  });

// Handle process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Disconnected from database');
});

export { prisma }; 