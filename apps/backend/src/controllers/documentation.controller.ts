import { Request, Response, NextFunction } from 'express';
import { documentationService } from '../services/documentation.service';
import { searchService } from '../services/search.service';
import { validateDocumentInput, validateSearchParams } from '../validators/documentation.validator';
import { cache } from '../middleware/cache';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import type { DocSearchParams } from '../types/documentation.types';

export class DocumentationController {
  public async getPage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const page = await documentationService.getPage(id);

      if (!page) {
        throw ApiError.notFound('Documentation page not found');
      }

      res.json(page);
    } catch (error) {
      next(error);
    }
  }

  public async getAllPages(req: Request, res: Response) {
    try {
      const pages = await documentationService.getAllPages();
      res.json(pages);
    } catch (error) {
      logger.error('Failed to get all documentation pages', { error });
      throw error;
    }
  }

  public async createPage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validateDocumentInput(req.body);
      const page = await documentationService.createPage(data, req.user!.id);
      
      // Clear relevant caches
      await cache.invalidatePattern('doc:pages:*');
      
      res.status(201).json(page);
    } catch (error) {
      next(error);
    }
  }

  public async updatePage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = validateDocumentInput(req.body);
      
      const page = await documentationService.updatePage(id, data);
      if (!page) {
        throw ApiError.notFound('Documentation page not found');
      }

      // Clear specific page cache
      await cache.invalidatePattern(`doc:page:${id}`);
      
      res.json(page);
    } catch (error) {
      next(error);
    }
  }

  public async deletePage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await documentationService.deletePage(id);
      
      // Clear all related caches
      await cache.invalidatePattern(`doc:page:${id}`);
      await cache.invalidatePattern('doc:pages:*');
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  public async getSectionsByTag(req: Request, res: Response) {
    try {
      const { tag } = req.params;
      const sections = await documentationService.getSectionsByTag(tag);
      res.json(sections);
    } catch (error) {
      logger.error('Failed to get documentation sections by tag', { error });
      throw error;
    }
  }

  public async search(req: Request, res: Response, next: NextFunction) {
    try {
      const params = validateSearchParams(req.query as DocSearchParams);
      const results = await searchService.searchDocumentation(params);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  public async getTableOfContents(req: Request, res: Response, next: NextFunction) {
    try {
      const toc = await documentationService.getTableOfContents();
      res.json(toc);
    } catch (error) {
      next(error);
    }
  }

  public async reorderPages(req: Request, res: Response, next: NextFunction) {
    try {
      const { pageIds } = req.body;
      await documentationService.reorderPages(pageIds);
      
      // Clear navigation caches
      await cache.invalidatePattern('doc:toc');
      await cache.invalidatePattern('doc:nav');
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

export const documentationController = new DocumentationController(); 