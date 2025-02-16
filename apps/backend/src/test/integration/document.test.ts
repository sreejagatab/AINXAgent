import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { createTestUser, createTestDocument } from '../setup';
import { generateToken } from '../../utils/auth';
import type { User, Document } from '@prisma/client';

describe('Document API', () => {
  let testUser: User;
  let testToken: string;
  let testDocument: Document;

  beforeEach(async () => {
    // Clear database and cache
    await prisma.$executeRaw`TRUNCATE TABLE "Document" CASCADE`;
    await redis.flushall();

    // Create test user and token
    testUser = await createTestUser();
    testToken = generateToken(testUser);
    testDocument = await createTestDocument(testUser.id);
  });

  describe('POST /api/documents', () => {
    it('should create a new document', async () => {
      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          title: 'Test Document',
          content: 'Test content',
          tags: ['test'],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Document');
      expect(response.body.authorId).toBe(testUser.id);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({
          title: 'Test Document',
          content: 'Test content',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should return document with author details', async () => {
      const response = await request(app)
        .get(`/api/documents/${testDocument.id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testDocument.id);
      expect(response.body.author).toBeDefined();
      expect(response.body.author.id).toBe(testUser.id);
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get('/api/documents/non-existent-id')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/documents/:id', () => {
    it('should update document', async () => {
      const response = await request(app)
        .put(`/api/documents/${testDocument.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          title: 'Updated Title',
          content: 'Updated content',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.content).toBe('Updated content');
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete document', async () => {
      const response = await request(app)
        .delete(`/api/documents/${testDocument.id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(204);

      // Verify document is deleted
      const deleted = await prisma.document.findUnique({
        where: { id: testDocument.id },
      });
      expect(deleted).toBeNull();
    });
  });
}); 