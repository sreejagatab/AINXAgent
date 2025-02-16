import { PrismaClient } from '@prisma/client';
import { createServer } from '../server';
import { redis } from '../lib/redis';
import { config } from '../config';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Connect to test database
  await prisma.$connect();
  
  // Clear database
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.documentationPage.deleteMany(),
    prisma.session.deleteMany(),
    prisma.apiKey.deleteMany(),
  ]);

  // Clear Redis cache
  await redis.flushall();

  // Create test server
  const app = await createServer();
  global.testServer = app.listen(config.PORT);
  global.testAgent = request.agent(app);
});

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect();
  await redis.quit();
  await global.testServer.close();
});

beforeEach(async () => {
  // Reset mocks
  jest.clearAllMocks();
  
  // Clear test data
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.documentationPage.deleteMany(),
    prisma.session.deleteMany(),
    prisma.apiKey.deleteMany(),
  ]);
  
  await redis.flushall();
});

// Test helpers
export const createTestUser = async (data: Partial<User> = {}) => {
  return await prisma.user.create({
    data: {
      email: data.email || 'test@example.com',
      password: await bcrypt.hash(data.password || 'password123', 10),
      name: data.name || 'Test User',
      role: data.role || 'USER',
      ...data,
    },
  });
};

export const generateTestToken = (user: User) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    config.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Disable logging during tests
logger.silent = true;

beforeEach(async () => {
  // Clear Redis cache before each test
  await redis.flushall();
});

afterEach(async () => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

// Global test timeout
jest.setTimeout(10000); 