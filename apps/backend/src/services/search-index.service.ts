import { prisma } from '../lib/prisma';
import { cache } from '../lib/redis';
import { logger } from '../utils/logger';
import type { DocPage, DocSearchParams, DocSearchResult } from '../types/documentation.types';

class SearchIndexService {
  private static instance: SearchIndexService;
  private readonly INDEX_CACHE_KEY = 'doc:search:index';
  private readonly INDEX_TTL = 3600; // 1 hour

  private constructor() {
    this.initializeIndex();
  }

  public static getInstance(): SearchIndexService {
    if (!SearchIndexService.instance) {
      SearchIndexService.instance = new SearchIndexService();
    }
    return SearchIndexService.instance;
  }

  private async initializeIndex(): Promise<void> {
    try {
      const hasIndex = await cache.exists(this.INDEX_CACHE_KEY);
      if (!hasIndex) {
        await this.rebuildIndex();
      }
    } catch (error) {
      logger.error('Failed to initialize search index', { error });
    }
  }

  public async rebuildIndex(): Promise<void> {
    try {
      const pages = await prisma.documentationPage.findMany({
        include: {
          sections: true,
        },
      });

      const index = this.buildIndexFromPages(pages);
      await cache.set(this.INDEX_CACHE_KEY, JSON.stringify(index), 'EX', this.INDEX_TTL);
      
      logger.info('Search index rebuilt successfully');
    } catch (error) {
      logger.error('Failed to rebuild search index', { error });
      throw error;
    }
  }

  private buildIndexFromPages(pages: DocPage[]): Record<string, string[]> {
    const index: Record<string, string[]> = {};

    pages.forEach(page => {
      const keywords = this.extractKeywords(page);
      index[page.id] = keywords;
    });

    return index;
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
    page.tags?.forEach(tag => addWords(tag));
    page.sections.forEach(section => {
      addWords(section.title);
      addWords(section.content);
      section.tags?.forEach(tag => addWords(tag));
    });

    return Array.from(keywords);
  }

  public async search(params: DocSearchParams): Promise<DocSearchResult> {
    try {
      const { query, category, tags, page = 1, limit = 10 } = params;
      const index = await this.getIndex();
      
      let matchingPageIds = new Set<string>();

      if (query) {
        const searchTerms = query.toLowerCase().split(/\W+/).filter(term => term.length > 2);
        Object.entries(index).forEach(([pageId, keywords]) => {
          const matches = searchTerms.some(term => 
            keywords.some(keyword => keyword.includes(term))
          );
          if (matches) {
            matchingPageIds.add(pageId);
          }
        });
      }

      const pages = await this.fetchMatchingPages(
        Array.from(matchingPageIds),
        category,
        tags,
        page,
        limit
      );

      return {
        pages,
        total: matchingPageIds.size,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Search failed', { error, params });
      throw error;
    }
  }

  private async getIndex(): Promise<Record<string, string[]>> {
    const cached = await cache.get(this.INDEX_CACHE_KEY);
    if (!cached) {
      await this.rebuildIndex();
      return this.getIndex();
    }
    return JSON.parse(cached);
  }

  private async fetchMatchingPages(
    pageIds: string[],
    category?: string,
    tags?: string[],
    page = 1,
    limit = 10
  ): Promise<DocPage[]> {
    const skip = (page - 1) * limit;

    return await prisma.documentationPage.findMany({
      where: {
        id: { in: pageIds },
        ...(category && { category }),
        ...(tags?.length && { tags: { hasEvery: tags } }),
      },
      include: {
        sections: true,
      },
      orderBy: {
        order: 'asc',
      },
      skip,
      take: limit,
    });
  }
}

export const searchIndexService = SearchIndexService.getInstance(); 