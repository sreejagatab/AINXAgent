import { request, createTestUser, clearDatabase } from '../helpers';
import { PrismaClient } from '@prisma/client';
import { CryptoUtils } from '@enhanced-ai-agent/shared';

const prisma = new PrismaClient();

describe('Authentication API', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request.post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return error for duplicate email', async () => {
      await createTestUser({ email: 'test@example.com' });

      const response = await request.post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser2',
        password: 'Test123!',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser({
        email: 'test@example.com',
        username: 'testuser',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request.post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'Test123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('id');
    });

    it('should return error for invalid credentials', async () => {
      const response = await request.post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
}); 