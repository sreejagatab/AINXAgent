import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../lib/prisma';
import { cache } from '../../lib/redis';
import { createTestDocPage, cleanupTestDocs } from '../helpers/documentation.helper';
import { createTestUser, cleanupTestUsers } from '../helpers/auth.helper';
import { generateToken } from '../../utils/auth';

describe('Documentation API Integration', () => {
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const user = await createTestUser({ role: 'VIEWER' });
    const admin = await createTestUser({ role: 'ADMIN' });
    authToken = generateToken(user);
    adminToken = generateToken(admin);
  });

  afterAll(async () => {
    await cleanupTestDocs();
    await cleanupTestUsers();
    await cache.flushdb();
    await prisma.$disconnect();
  });

  describe('GET /api/docs/pages', () => {
    beforeEach(async () => {
      await cleanupTestDocs();
    });

    it('should return all documentation pages', async () => {
      const testPage = await createTestDocPage();

      const response = await request(app)
        .get('/api/docs/pages')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(testPage.id);
    });

    it('should cache the response', async () => {
      await createTestDocPage();

      // First request
      await request(app).get('/api/docs/pages').expect(200);

      // Second request should hit cache
      const spy = jest.spyOn(prisma.documentationPage, 'findMany');
      await request(app).get('/api/docs/pages').expect(200);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/docs/pages/:id', () => {
    it('should return a specific page', async () => {
      const testPage = await createTestDocPage();

      const response = await request(app)
        .get(`/api/docs/pages/${testPage.id}`)
        .expect(200);

      expect(response.body.id).toBe(testPage.id);
    });

    it('should return 404 for non-existent page', async () => {
      await request(app)
        .get('/api/docs/pages/non-existent')
        .expect(404);
    });
  });

  describe('POST /api/docs/pages', () => {
    it('should create a new page with admin token', async () => {
      const pageData = {
        title: 'Test Page',
        description: 'Test Description',
        category: 'test',
        sections: [
          {
            title: 'Section 1',
            content: 'Test Content',
          },
        ],
      };

      const response = await request(app)
        .post('/api/docs/pages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(pageData)
        .expect(201);

      expect(response.body.title).toBe(pageData.title);
      expect(response.body.sections).toHaveLength(1);
    });

    it('should return 403 with viewer token', async () => {
      await request(app)
        .post('/api/docs/pages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('PUT /api/docs/pages/:id', () => {
    it('should update an existing page', async () => {
      const testPage = await createTestDocPage();
      const updateData = {
        title: 'Updated Title',
        description: testPage.description,
        category: testPage.category,
        sections: testPage.sections,
      };

      const response = await request(app)
        .put(`/api/docs/pages/${testPage.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
    });
  });

  describe('DELETE /api/docs/pages/:id', () => {
    it('should delete a page', async () => {
      const testPage = await createTestDocPage();

      await request(app)
        .delete(`/api/docs/pages/${testPage.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const page = await prisma.documentationPage.findUnique({
        where: { id: testPage.id },
      });
      expect(page).toBeNull();
    });
  });
}); 