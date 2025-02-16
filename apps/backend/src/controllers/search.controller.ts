import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service';
import { validateSearchParams } from '../validators/search.validator';
import { performanceLogger } from '../middleware/logging';
import { logger } from '../utils/logger';
import type { DocSearchParams } from '../types/search.types';

export class SearchController {
  @performanceLogger('Search Documentation')
  public async search(req: Request, res: Response, next: NextFunction) {
    try {
      const params = validateSearchParams(req.query as DocSearchParams);
      
      // Log search query for analytics
      logger.info('Search request:', {
        query: params.query,
        category: params.category,
        tags: params.tags,
        userId: req.user?.id,
      });

      const results = await searchService.searchDocumentation(params);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  public async getSearchStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await searchService.getSearchStats(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  public async getSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.query;
      if (typeof query !== 'string') {
        return res.json({ suggestions: [] });
      }

      const suggestions = await searchService.getSuggestions(query);
      res.json({ suggestions });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController(); 