import request from 'supertest';
import { createServer } from '../server';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { createTestUser, generateTestToken } from '../test/setup';

describe('Auth API', () => {
  let app: Express.Application;

  beforeAll(async () => {
    app = await createServer();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 409 if email already exists', async () => {
      await createTestUser({ email: 'existing@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'Password123!',
          name: 'Test User',
        });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('CONFLICT');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await createTestUser({
        email: 'user@example.com',
        password: 'Password123!',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('user@example.com');
    });

    it('should return 401 with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);

      // Verify token is blacklisted
      const isBlacklisted = await redis.exists(`blacklist:${token}`);
      expect(isBlacklisted).toBe(1);
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await redis.flushall();
  });
}); 