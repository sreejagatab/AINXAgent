import { documentationService } from '../documentation.service';
import { markdownService } from '../markdown.service';
import { cache } from '../../lib/redis';
import { prisma } from '../../lib/prisma';
import { createTestDocPage, createTestDocSection, cleanupTestDocs } from '../../test/helpers/documentation.helper';

jest.mock('../../lib/redis');
jest.mock('../markdown.service');

describe('DocumentationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanupTestDocs();
  });

  describe('getPage', () => {
    it('should return cached page if available', async () => {
      const testPage = await createTestDocPage();
      jest.spyOn(cache, 'get').mockResolvedValue(JSON.stringify(testPage));

      const result = await documentationService.getPage(testPage.id);

      expect(result).toEqual(testPage);
      expect(prisma.documentationPage.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch and cache page if not in cache', async () => {
      const testPage = await createTestDocPage();
      jest.spyOn(cache, 'get').mockResolvedValue(null);
      jest.spyOn(markdownService, 'processMarkdown').mockReturnValue('Processed Content');

      const result = await documentationService.getPage(testPage.id);

      expect(result).toBeTruthy();
      expect(cache.set).toHaveBeenCalled();
      expect(markdownService.processMarkdown).toHaveBeenCalled();
    });
  });

  // Add more test cases for other service methods...
}); 