import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { aiService } from './ai.service';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import type { 
  SearchQuery, 
  SearchResult, 
  SearchFilter,
  SearchStats 
} from '../types/search.types';

export class SearchService {
  private static instance: SearchService;
  private readonly CACHE_PREFIX = 'search:';
  private readonly CACHE_TTL = 300; // 5 minutes

  private constructor() {}

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  public async search(
    query: SearchQuery,
    filter: SearchFilter,
    userId: string
  ): Promise<SearchResult[]> {
    try {
      const cacheKey = this.generateCacheKey(query, filter, userId);
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      // Generate embeddings for semantic search
      const embeddings = await aiService.generateEmbeddings(query.text);

      // Combine full-text and semantic search
      const results = await prisma.$queryRaw`
        WITH ranked_results AS (
          SELECT 
            d.*,
            ts_rank_cd(to_tsvector('english', d.content), plainto_tsquery('english', ${query.text})) as text_rank,
            (d.embeddings <=> ${embeddings}) as semantic_rank
          FROM "Document" d
          WHERE 
            (d."authorId" = ${userId} OR d.published = true)
            ${filter.tags ? `AND d.tags @> ${filter.tags}` : ''}
            ${filter.type ? `AND d.type = ${filter.type}` : ''}
          ORDER BY 
            (text_rank * 0.3 + semantic_rank * 0.7) DESC
          LIMIT ${filter.limit || 10}
          OFFSET ${filter.offset || 0}
        )
        SELECT * FROM ranked_results;
      `;

      // Cache results
      await redis.set(
        cacheKey,
        JSON.stringify(results),
        'EX',
        this.CACHE_TTL
      );

      // Track search metrics
      await this.trackSearch(query, results.length, userId);

      return results;
    } catch (error) {
      logger.error('Search failed:', error);
      throw error;
    }
  }

  public async getSearchSuggestions(
    query: string,
    userId: string
  ): Promise<string[]> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}suggestions:${query}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const suggestions = await prisma.$queryRaw`
        SELECT word, similarity(word, ${query}) as sim
        FROM ts_stat('
          SELECT to_tsvector(''english'', content) 
          FROM "Document" 
          WHERE "authorId" = ${userId} OR published = true
        ')
        WHERE word % ${query}
        ORDER BY sim DESC, word
        LIMIT 5;
      `;

      await redis.set(
        cacheKey,
        JSON.stringify(suggestions),
        'EX',
        this.CACHE_TTL
      );

      return suggestions;
    } catch (error) {
      logger.error('Failed to get search suggestions:', error);
      throw error;
    }
  }

  public async getSearchStats(userId: string): Promise<SearchStats> {
    try {
      const stats = await prisma.searchMetrics.groupBy({
        by: ['query'],
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        _count: {
          query: true,
        },
        orderBy: {
          _count: {
            query: 'desc',
          },
        },
        take: 10,
      });

      return {
        topQueries: stats.map(s => ({
          query: s.query,
          count: s._count.query,
        })),
      };
    } catch (error) {
      logger.error('Failed to get search stats:', error);
      throw error;
    }
  }

  private generateCacheKey(
    query: SearchQuery,
    filter: SearchFilter,
    userId: string
  ): string {
    const hash = require('crypto')
      .createHash('md5')
      .update(JSON.stringify({ query, filter, userId }))
      .digest('hex');
    return `${this.CACHE_PREFIX}${hash}`;
  }

  private async trackSearch(
    query: SearchQuery,
    resultCount: number,
    userId: string
  ): Promise<void> {
    try {
      await prisma.searchMetrics.create({
        data: {
          query: query.text,
          resultCount,
          userId,
        },
      });
    } catch (error) {
      logger.error('Failed to track search:', error);
    }
  }
}

export const searchService = SearchService.getInstance(); 