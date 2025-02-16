import {
  generatePageId,
  extractHeadings,
  buildTableOfContents,
  validatePageStructure,
  sortPagesByOrder,
  sortSectionsByOrder,
} from '../documentation.utils';
import type { DocPage, DocSection } from '../../types/documentation.types';

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