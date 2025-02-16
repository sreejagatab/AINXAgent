import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import type { DocSection, DocPage, DocSearchResult } from '../types/documentation.types';

class DocumentationService {
  private static instance: DocumentationService;
  private cache: Map<string, DocPage> = new Map();
  private searchIndex: Map<string, string[]> = new Map();

  private constructor() {
    this.buildSearchIndex();
  }

  public static getInstance(): DocumentationService {
    if (!DocumentationService.instance) {
      DocumentationService.instance = new DocumentationService();
    }
    return DocumentationService.instance;
  }

  private async buildSearchIndex(): Promise<void> {
    try {
      const pages = await this.getAllPages();
      pages.forEach(page => {
        const keywords = this.extractKeywords(page);
        this.searchIndex.set(page.id, keywords);
      });
      logger.info('Documentation search index built successfully');
    } catch (error) {
      logger.error('Failed to build documentation search index', { error });
    }
  }

  private extractKeywords(page: DocPage): string[] {
    const keywords = new Set<string>();
    const addWords = (text: string) => {
      text.toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 2)
        .forEach(word => keywords.add(word));
    };

    addWords(page.title);
    addWords(page.description);
    page.sections.forEach(section => {
      addWords(section.title);
      addWords(section.content);
    });

    return Array.from(keywords);
  }

  public async getPage(id: string): Promise<DocPage | null> {
    try {
      if (this.cache.has(id)) {
        return this.cache.get(id)!;
      }

      const page = await this.fetchPage(id);
      if (page) {
        this.cache.set(id, page);
      }
      return page;
    } catch (error) {
      logger.error('Failed to get documentation page', { error, id });
      return null;
    }
  }

  private async fetchPage(id: string): Promise<DocPage | null> {
    try {
      const response = await fetch(`/api/docs/pages/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      logger.error('Failed to fetch documentation page', { error, id });
      return null;
    }
  }

  public async search(query: string): Promise<DocSearchResult[]> {
    const results: DocSearchResult[] = [];
    const searchTerms = query.toLowerCase().split(/\W+/).filter(term => term.length > 2);

    for (const [pageId, keywords] of this.searchIndex.entries()) {
      const matches = searchTerms.filter(term => 
        keywords.some(keyword => keyword.includes(term))
      );

      if (matches.length > 0) {
        const page = await this.getPage(pageId);
        if (page) {
          results.push({
            page,
            relevance: matches.length / searchTerms.length,
            matchedTerms: matches,
          });
        }
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  public async getSectionsByTag(tag: string): Promise<DocSection[]> {
    try {
      const pages = await this.getAllPages();
      return pages.flatMap(page => 
        page.sections.filter(section => section.tags?.includes(tag))
      );
    } catch (error) {
      logger.error('Failed to get documentation sections by tag', { error, tag });
      return [];
    }
  }

  private async getAllPages(): Promise<DocPage[]> {
    try {
      const response = await fetch('/api/docs/pages');
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      logger.error('Failed to fetch all documentation pages', { error });
      return [];
    }
  }

  public clearCache(): void {
    this.cache.clear();
    this.buildSearchIndex();
  }
}

export const documentationService = DocumentationService.getInstance(); 