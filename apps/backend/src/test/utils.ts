import { PrismaClient, User } from '@prisma/client';
import { redis } from '../lib/redis';
import { config } from '../config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const testUtils = {
  async createUser(data: Partial<User> = {}): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email || `test-${Date.now()}@example.com`,
        password: await bcrypt.hash(data.password || 'password123', 10),
        name: data.name || 'Test User',
        role: data.role || 'USER',
        ...data,
      },
    });
  },

  generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  async clearDatabase() {
    const tables = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    await Promise.all(
      tables.map(({ tablename }) =>
        prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`)
      )
    );
  },

  async clearCache() {
    await redis.flushall();
  },

  async cleanup() {
    await this.clearDatabase();
    await this.clearCache();
  },
};

export const mockRequest = () => {
  const req: any = {};
  req.body = jest.fn().mockReturnValue(req);
  req.params = jest.fn().mockReturnValue(req);
  req.query = jest.fn().mockReturnValue(req);
  return req;
};

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = jest.fn(); 