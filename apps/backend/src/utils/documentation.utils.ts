import { marked } from 'marked';
import slugify from 'slugify';
import type { DocPage, DocSection } from '../types/documentation.types';

export function generatePageId(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const tokens = marked.lexer(content);

  tokens.forEach(token => {
    if (token.type === 'heading') {
      headings.push({
        id: slugify(token.text, { lower: true }),
        text: token.text,
        level: token.depth,
      });
    }
  });

  return headings;
}

export function buildTableOfContents(page: DocPage): { id: string; text: string; level: number }[] {
  const toc: { id: string; text: string; level: number }[] = [];

  // Add page title as level 1
  toc.push({
    id: generatePageId(page.title),
    text: page.title,
    level: 1,
  });

  // Add section headings
  page.sections.forEach(section => {
    toc.push({
      id: generatePageId(section.title),
      text: section.title,
      level: 2,
    });

    // Add headings from section content
    const contentHeadings = extractHeadings(section.content);
    contentHeadings.forEach(heading => {
      toc.push({
        ...heading,
        level: heading.level + 2, // Offset by 2 since section title is level 2
      });
    });
  });

  return toc;
}

export function validatePageStructure(page: DocPage): string[] {
  const errors: string[] = [];

  if (!page.title.trim()) {
    errors.push('Page title is required');
  }

  if (!page.description.trim()) {
    errors.push('Page description is required');
  }

  if (!page.sections.length) {
    errors.push('Page must have at least one section');
  }

  page.sections.forEach((section, index) => {
    if (!section.title.trim()) {
      errors.push(`Section ${index + 1} title is required`);
    }
    if (!section.content.trim()) {
      errors.push(`Section ${index + 1} content is required`);
    }
  });

  return errors;
}

export function sortPagesByOrder(pages: DocPage[]): DocPage[] {
  return [...pages].sort((a, b) => a.order - b.order);
}

export function sortSectionsByOrder(sections: DocSection[]): DocSection[] {
  return [...sections].sort((a, b) => a.order - b.order);
} 