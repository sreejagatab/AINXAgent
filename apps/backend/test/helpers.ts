import { PrismaClient } from '@prisma/client';
import { JwtService } from '../src/services/jwt.service';
import { CryptoUtils } from '@enhanced-ai-agent/shared';
import supertest from 'supertest';
import { app } from '../src/index';

const prisma = new PrismaClient();
const jwtService = JwtService.getInstance();

export const request = supertest(app);

export const createTestUser = async (data: {
  email?: string;
  username?: string;
  role?: string;
  isActive?: boolean;
}) => {
  const password = await CryptoUtils.hashPassword('Test123!');
  return prisma.user.create({
    data: {
      email: data.email || 'test@example.com',
      username: data.username || 'testuser',
      password,
      role: data.role || 'USER',
      isActive: data.isActive ?? true,
      preferences: {
        create: {
          theme: 'light',
          notifications: {
            email: true,
            push: false,
            desktop: true,
            frequency: 'daily',
          },
          language: 'en',
          aiModel: 'gpt-3.5-turbo',
        },
      },
    },
    include: {
      preferences: true,
    },
  });
};

export const generateAuthToken = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error('Test user not found');

  const { token } = await jwtService.generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return token;
};

export const createTestPrompt = async (userId: string) => {
  return prisma.prompt.create({
    data: {
      userId,
      title: 'Test Prompt',
      content: 'This is a test prompt with {input}',
      type: 'completion',
      tags: ['test', 'example'],
      model: 'gpt-3.5-turbo',
      parameters: {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
      },
      status: 'active',
    },
  });
};

export const clearDatabase = async () => {
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
}; 