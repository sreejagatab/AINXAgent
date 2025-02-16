import { markdownService } from '../markdown.service';
import { sanitizeHtml } from '../../utils/sanitize';

jest.mock('../../utils/sanitize');

describe('MarkdownService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (sanitizeHtml as jest.Mock).mockImplementation(html => html);
  });

  describe('processMarkdown', () => {
    it('should process basic markdown', () => {
      const markdown = '# Title\n\nParagraph';
      const result = markdownService.processMarkdown(markdown);

      expect(result).toContain('<h1');
      expect(result).toContain('<p');
    });

    it('should handle code blocks with syntax highlighting', () => {
      const markdown = '```typescript\nconst x = 1;\n```';
      const result = markdownService.processMarkdown(markdown);

      expect(result).toContain('class="hljs');
      expect(result).toContain('language-typescript');
    });

    it('should create anchor links for headings', () => {
      const markdown = '## Section Title';
      const result = markdownService.processMarkdown(markdown);

      expect(result).toContain('id="section-title"');
      expect(result).toContain('class="anchor"');
    });

    it('should handle external links', () => {
      const markdown = '[Link](https://example.com)';
      const result = markdownService.processMarkdown(markdown);

      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });
  });

  // Add more test cases for other markdown processing features...
}); 