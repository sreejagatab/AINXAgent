import {
  generatePageId,
  extractHeadings,
  buildTableOfContents,
  validatePageStructure,
  sortPagesByOrder,
  sortSectionsByOrder,
} from '../documentation.utils';
import type { DocPage, DocSection } from '../../types/documentation.types';
import { DocumentationGenerator } from '../documentation';
import { Router } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises');
jest.mock('express');

describe('Documentation Utils', () => {
  describe('generatePageId', () => {
    it('should generate valid page IDs', () => {
      expect(generatePageId('Test Page')).toBe('test-page');
      expect(generatePageId('Complex! Title & Stuff')).toBe('complex-title-stuff');
    });
  });

  describe('extractHeadings', () => {
    it('should extract headings from markdown content', () => {
      const content = `
# Heading 1
Some content
## Heading 2
More content
### Heading 3
      `.trim();

      const headings = extractHeadings(content);

      expect(headings).toHaveLength(3);
      expect(headings[0]).toEqual({
        id: 'heading-1',
        text: 'Heading 1',
        level: 1,
      });
    });
  });

  describe('buildTableOfContents', () => {
    it('should build TOC from page structure', () => {
      const page: DocPage = {
        id: '1',
        title: 'Test Page',
        description: 'Test Description',
        sections: [
          {
            id: '1',
            title: 'Section 1',
            content: '# Heading\n## Subheading',
            order: 0,
          },
        ],
        category: 'test',
        order: 0,
        lastUpdated: new Date(),
      };

      const toc = buildTableOfContents(page);

      expect(toc[0].text).toBe('Test Page');
      expect(toc[1].text).toBe('Section 1');
    });
  });

  describe('validatePageStructure', () => {
    it('should validate page structure', () => {
      const validPage: DocPage = {
        id: '1',
        title: 'Test Page',
        description: 'Test Description',
        sections: [
          {
            id: '1',
            title: 'Section 1',
            content: 'Content',
            order: 0,
          },
        ],
        category: 'test',
        order: 0,
        lastUpdated: new Date(),
      };

      const errors = validatePageStructure(validPage);
      expect(errors).toHaveLength(0);
    });
  });

  describe('sorting', () => {
    it('should sort pages by order', () => {
      const pages: DocPage[] = [
        { order: 2 },
        { order: 1 },
        { order: 3 },
      ] as DocPage[];

      const sorted = sortPagesByOrder(pages);
      expect(sorted[0].order).toBe(1);
      expect(sorted[1].order).toBe(2);
      expect(sorted[2].order).toBe(3);
    });

    it('should sort sections by order', () => {
      const sections: DocSection[] = [
        { order: 2 },
        { order: 1 },
        { order: 3 },
      ] as DocSection[];

      const sorted = sortSectionsByOrder(sections);
      expect(sorted[0].order).toBe(1);
      expect(sorted[1].order).toBe(2);
      expect(sorted[2].order).toBe(3);
    });
  });
});

describe('DocumentationGenerator', () => {
  let generator: DocumentationGenerator;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(() => {
    mockRouter = {
      stack: [
        {
          route: {
            path: '/test',
            methods: { GET: true },
            stack: [
              { name: 'authenticate' },
              { name: 'testMiddleware' },
            ],
          },
        },
      ],
    } as any;

    generator = DocumentationGenerator.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateFromRouter', () => {
    it('should extract routes from router', () => {
      generator.generateFromRouter(mockRouter);
      
      // Verify paths were added to spec
      const spec = (generator as any).spec;
      expect(spec.paths['/test']).toBeDefined();
      expect(spec.paths['/test'].get).toBeDefined();
    });

    it('should generate correct tags', () => {
      generator.generateFromRouter(mockRouter);
      
      const spec = (generator as any).spec;
      expect(spec.paths['/test'].get.tags).toEqual(['Test']);
    });

    it('should include security requirements for authenticated routes', () => {
      generator.generateFromRouter(mockRouter);
      
      const spec = (generator as any).spec;
      expect(spec.paths['/test'].get.security).toEqual([{ BearerAuth: [] }]);
    });
  });

  describe('saveSpec', () => {
    it('should save spec to file', async () => {
      const mockWriteFile = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;
      const mockMkdir = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;

      await generator.saveSpec();

      expect(mockMkdir).toHaveBeenCalled();
      expect(mockWriteFile).toHaveBeenCalled();
      expect(mockWriteFile.mock.calls[0][1]).toContain('"openapi": "3.0.3"');
    });

    it('should handle errors when saving spec', async () => {
      const mockWriteFile = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;
      mockWriteFile.mockRejectedValue(new Error('Write error'));

      await expect(generator.saveSpec()).rejects.toThrow('Write error');
    });
  });
}); 