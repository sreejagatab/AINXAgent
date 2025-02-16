import { PrismaClient } from '@prisma/client';
import { RedisService } from '../src/services/redis.service';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';

const prisma = new PrismaClient();
const redis = RedisService.getInstance();

// Global test setup
beforeAll(async () => {
  // Clear test database
  const tables = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
      );
    }
  }

  // Clear Redis
  await redis.flushall();
});

// Cleanup after each test
afterEach(async () => {
  jest.clearAllMocks();
  await redis.flushall();
});

// Global test teardown
afterAll(async () => {
  await prisma.$disconnect();
  await redis.disconnect();
});

// Mock performance monitor
jest.mock('@enhanced-ai-agent/shared', () => ({
  ...jest.requireActual('@enhanced-ai-agent/shared'),
  PerformanceMonitor: {
    getInstance: jest.fn().mockReturnValue({
      recordMetric: jest.fn(),
      recordError: jest.fn(),
    }),
  },
}));

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
  REDIS_URL: 'redis://localhost:6379/1',
  JWT_SECRET: 'test-secret',
  JWT_EXPIRY: '1h',
  SMTP_HOST: 'smtp.test.com',
  SMTP_PORT: '587',
  SMTP_USER: 'test@test.com',
  SMTP_PASSWORD: 'test-password',
  EMAIL_FROM: 'noreply@test.com',
}; 