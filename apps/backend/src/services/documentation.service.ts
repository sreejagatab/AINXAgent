import { prisma } from '../lib/prisma';
import { cache } from '../lib/redis';
import { vectorStoreService } from './vector-store.service';
import { markdownService } from './markdown.service';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import type { DocPage, DocSection } from '../types/documentation.types';

export class DocumentationService {
  private static instance: DocumentationService;
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor() {}

  public static getInstance(): DocumentationService {
    if (!DocumentationService.instance) {
      DocumentationService.instance = new DocumentationService();
    }
    return DocumentationService.instance;
  }

  public async getPage(id: string): Promise<DocPage | null> {
    const cacheKey = `doc:page:${id}`;
    const cached = await cache.getJSON<DocPage>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const page = await prisma.documentationPage.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!page) {
      return null;
    }

    // Process markdown content
    const processedPage = {
      ...page,
      sections: page.sections.map(section => ({
        ...section,
        content: markdownService.processMarkdown(section.content),
      })),
    };

    await cache.setJSON(cacheKey, processedPage, this.CACHE_TTL);
    return processedPage;
  }

  public async createPage(data: Partial<DocPage>, authorId: string): Promise<DocPage> {
    const page = await prisma.documentationPage.create({
      data: {
        ...data,
        authorId,
        sections: {
          create: data.sections?.map((section, index) => ({
            ...section,
            order: index,
          })),
        },
      },
      include: {
        sections: true,
      },
    });

    // Index content for search
    await this.indexPageContent(page);

    return page;
  }

  public async updatePage(id: string, data: Partial<DocPage>): Promise<DocPage | null> {
    const page = await prisma.documentationPage.update({
      where: { id },
      data: {
        ...data,
        sections: {
          deleteMany: {},
          create: data.sections?.map((section, index) => ({
            ...section,
            order: index,
          })),
        },
      },
      include: {
        sections: true,
      },
    });

    // Update search index
    await this.indexPageContent(page);

    return page;
  }

  private async indexPageContent(page: DocPage): Promise<void> {
    try {
      const content = [
        page.title,
        page.description,
        ...page.sections.map(section => section.content),
      ].join('\n\n');

      await vectorStoreService.addDocument(content, {
        id: page.id,
        type: 'documentation',
        title: page.title,
      });
    } catch (error) {
      logger.error('Failed to index page content:', error);
      // Don't throw - indexing failure shouldn't block page creation
    }
  }

  public async getAllPages(): Promise<DocPage[]> {
    try {
      const cacheKey = 'doc:pages:all';
      const cached = await cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const pages = await prisma.documentationPage.findMany({
        include: {
          sections: true,
        },
        orderBy: {
          order: 'asc',
        },
      });

      const processedPages = pages.map(this.processPage);
      await cache.set(cacheKey, JSON.stringify(processedPages), 'EX', this.CACHE_TTL);
      
      return processedPages;
    } catch (error) {
      logger.error('Failed to get all documentation pages', { error });
      throw error;
    }
  }

  // ... (rest of the service methods)
}

export const documentationService = DocumentationService.getInstance(); 