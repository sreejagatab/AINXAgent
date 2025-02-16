import { request, createTestUser, createTestPrompt, generateAuthToken } from '../helpers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Prompt API', () => {
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

  describe('POST /api/prompts', () => {
    it('should create a new prompt successfully', async () => {
      const promptData = {
        title: 'Test Prompt',
        content: 'Generate a {input} using AI',
        type: 'completion',
        tags: ['test', 'ai'],
        model: 'gpt-3.5-turbo',
        parameters: {
          temperature: 0.7,
          maxTokens: 1000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
        },
      };

      const response = await request
        .post('/api/prompts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(promptData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        ...promptData,
        userId,
        status: 'draft',
        version: 1,
      });
    });

    it('should validate prompt parameters', async () => {
      const invalidPrompt = {
        title: '',  // Invalid: empty title
        content: 'Test content',
        type: 'invalid_type',  // Invalid: not in enum
        tags: [],  // Invalid: empty tags array
        model: 'gpt-4',
        parameters: {
          temperature: 3.0,  // Invalid: > 2
        },
      };

      const response = await request
        .post('/api/prompts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPrompt);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });
  });

  describe('POST /api/prompts/:id/execute', () => {
    it('should execute a prompt successfully', async () => {
      const prompt = await createTestPrompt(userId);
      
      const response = await request
        .post(`/api/prompts/${prompt.id}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ input: 'test input' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('output');
      expect(response.body.data).toHaveProperty('tokenUsage');
      expect(response.body.data.promptId).toBe(prompt.id);
    });

    it('should handle rate limiting', async () => {
      const prompt = await createTestPrompt(userId);
      const requests = Array(35).fill(null).map(() => 
        request
          .post(`/api/prompts/${prompt.id}/execute`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ input: 'test input' })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('GET /api/prompts/history', () => {
    it('should return user prompt history', async () => {
      // Create multiple prompts
      await Promise.all([
        createTestPrompt(userId),
        createTestPrompt(userId),
        createTestPrompt(userId),
      ]);

      const response = await request
        .get('/api/prompts/history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 2, page: 1 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
      });
    });
  });

  describe('PUT /api/prompts/:id', () => {
    it('should update prompt successfully', async () => {
      const prompt = await createTestPrompt(userId);
      const updates = {
        title: 'Updated Title',
        tags: ['updated', 'tags'],
      };

      const response = await request
        .put(`/api/prompts/${prompt.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        ...prompt,
        ...updates,
        version: 2,
      });
    });

    it('should prevent unauthorized updates', async () => {
      const otherUser = await createTestUser({
        email: 'other@example.com',
        username: 'otheruser',
      });
      const prompt = await createTestPrompt(otherUser.id);

      const response = await request
        .put(`/api/prompts/${prompt.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Unauthorized Update' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
}); 