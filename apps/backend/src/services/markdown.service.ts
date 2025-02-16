import { marked } from 'marked';
import hljs from 'highlight.js';
import { sanitizeHtml } from '../utils/sanitize';
import { logger } from '../utils/logger';

class MarkdownService {
  private static instance: MarkdownService;
  private renderer: marked.Renderer;

  private constructor() {
    this.renderer = new marked.Renderer();
    this.configureRenderer();
    this.configureMarked();
  }

  public static getInstance(): MarkdownService {
    if (!MarkdownService.instance) {
      MarkdownService.instance = new MarkdownService();
    }
    return MarkdownService.instance;
  }

  private configureRenderer() {
    // Customize link rendering
    this.renderer.link = (href, title, text) => {
      const isExternal = href?.startsWith('http');
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${attrs}${title ? ` title="${title}"` : ''}>${text}</a>`;
    };

    // Customize code block rendering
    this.renderer.code = (code, language) => {
      const validLanguage = hljs.getLanguage(language || '') ? language : 'plaintext';
      const highlightedCode = hljs.highlight(code, { language: validLanguage }).value;
      return `<pre><code class="hljs language-${validLanguage}">${highlightedCode}</code></pre>`;
    };

    // Customize heading rendering with anchor links
    this.renderer.heading = (text, level) => {
      const slug = text.toLowerCase().replace(/[^\w]+/g, '-');
      return `
        <h${level} id="${slug}">
          <a class="anchor" href="#${slug}">
            <span class="header-link">#</span>
          </a>
          ${text}
        </h${level}>
      `;
    };
  }

  private configureMarked() {
    marked.setOptions({
      renderer: this.renderer,
      gfm: true,
      breaks: false,
      pedantic: false,
      smartLists: true,
      smartypants: true,
    });
  }

  public processMarkdown(markdown: string): string {
    try {
      const html = marked(markdown);
      return sanitizeHtml(html);
    } catch (error) {
      logger.error('Failed to process markdown', { error });
      return '';
    }
  }

  public processInlineMarkdown(markdown: string): string {
    try {
      const html = marked.parseInline(markdown);
      return sanitizeHtml(html);
    } catch (error) {
      logger.error('Failed to process inline markdown', { error });
      return markdown;
    }
  }
}

export const markdownService = MarkdownService.getInstance(); 