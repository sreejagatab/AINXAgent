import { request, createTestUser, generateAuthToken } from '../helpers';
import { PrismaClient } from '@prisma/client';
import { CryptoUtils } from '@enhanced-ai-agent/shared';

const prisma = new PrismaClient();

describe('User API', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const user = await createTestUser({
      email: 'test@example.com',
      username: 'testuser',
    });
    userId = user.id;
    authToken = await generateAuthToken(userId);
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile', async () => {
      const response = await request
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        email: 'test@example.com',
        username: 'testuser',
        preferences: {
          theme: 'light',
          language: 'en',
        },
      });
    });

    it('should handle invalid token', async () => {
      const response = await request
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const updates = {
        username: 'updateduser',
        preferences: {
          theme: 'dark',
          notifications: {
            email: false,
            desktop: true,
          },
        },
      };

      const response = await request
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(updates);
    });

    it('should prevent duplicate username', async () => {
      await createTestUser({
        email: 'other@example.com',
        username: 'takenusername',
      });

      const response = await request
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'takenusername' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('username');
    });
  });

  describe('PUT /api/users/password', () => {
    it('should update password successfully', async () => {
      const response = await request
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'Test123!',
          newPassword: 'NewTest123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify new password works
      const loginResponse = await request
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'NewTest123!',
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
    });

    it('should validate current password', async () => {
      const response = await request
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewTest123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('current password');
    });
  });

  describe('DELETE /api/users/account', () => {
    it('should delete user account', async () => {
      const response = await request
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: 'Test123!' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify account is deleted
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(user).toBeNull();
    });

    it('should require password confirmation', async () => {
      const response = await request
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: 'WrongPassword123!' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
}); 