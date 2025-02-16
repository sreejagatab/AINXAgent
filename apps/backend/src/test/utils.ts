import { prisma } from '../lib/prisma';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { User, Prompt, Tool } from '@prisma/client';

export async function createTestUser(data: Partial<User> = {}): Promise<User> {
  const password = await hash(data.password || 'password123', 10);
  
  return await prisma.user.create({
    data: {
      email: data.email || 'test@example.com',
      name: data.name || 'Test User',
      password,
      role: data.role || 'USER',
      ...data,
    },
  });
}

export async function createTestPrompt(
  userId: string,
  data: Partial<Prompt> = {}
): Promise<Prompt> {
  return await prisma.prompt.create({
    data: {
      name: data.name || 'Test Prompt',
      template: data.template || 'Test template with {{variable}}',
      variables: data.variables || [
        {
          name: 'variable',
          type: 'string',
          required: true,
        },
      ],
      userId,
      ...data,
    },
  });
}

export async function createTestTool(
  userId: string,
  data: Partial<Tool> = {}
): Promise<Tool> {
  return await prisma.tool.create({
    data: {
      name: data.name || 'Test Tool',
      type: data.type || 'http',
      parameters: data.parameters || {
        url: 'https://api.example.com',
        method: 'GET',
      },
      userId,
      ...data,
    },
  });
}

export function generateTestToken(userId: string, role: string = 'USER'): string {
  return jwt.sign(
    { userId, role },
    config.auth.jwtSecret,
    { expiresIn: '1h' }
  );
}

export async function clearDatabase(): Promise<void> {
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
}

export function mockRequest(overrides = {}) {
  return {
    user: { id: 'test-user-id', role: 'USER' },
    body: {},
    query: {},
    params: {},
    headers: {},
    ...overrides,
  };
}

export function mockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

export function mockNext() {
  return jest.fn();
} 