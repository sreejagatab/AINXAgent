import { searchIndexService } from '../search-index.service';
import { cache } from '../../lib/redis';
import { prisma } from '../../lib/prisma';
import { createTestDocPage, cleanupTestDocs } from '../../test/helpers/documentation.helper';

jest.mock('../../lib/redis');

describe('SearchIndexService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanupTestDocs();
  });

  describe('search', () => {
    it('should find pages matching search query', async () => {
      const testPage1 = await createTestDocPage({
        title: 'Unique Test Title',
        description: 'Test Description',
      });

      const testPage2 = await createTestDocPage({
        title: 'Another Title',
        description: 'Different Content',
      });

      const result = await searchIndexService.search({
        query: 'unique test',
      });

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].id).toBe(testPage1.id);
    });

    it('should filter by category', async () => {
      const testPage = await createTestDocPage({
        category: 'test-category',
      });

      const result = await searchIndexService.search({
        category: 'test-category',
      });

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].id).toBe(testPage.id);
    });

    it('should filter by tags', async () => {
      const testPage = await createTestDocPage({
        tags: ['test-tag'],
      });

      const result = await searchIndexService.search({
        tags: ['test-tag'],
      });

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].id).toBe(testPage.id);
    });

    it('should handle pagination', async () => {
      await Promise.all([
        createTestDocPage(),
        createTestDocPage(),
        createTestDocPage(),
      ]);

      const result = await searchIndexService.search({
        page: 2,
        limit: 1,
      });

      expect(result.pages).toHaveLength(1);
      expect(result.total).toBe(3);
      expect(result.page).toBe(2);
    });
  });
}); 