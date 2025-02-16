import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { aiService } from './ai.service';
import { storageService } from './storage.service';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import type { 
  CreateDocumentDto, 
  UpdateDocumentDto,
  DocumentWithRelations,
  DocumentFilter 
} from '../types/document.types';

export class DocumentService {
  private static instance: DocumentService;
  private readonly CACHE_PREFIX = 'document:';
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor() {}

  public static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  public async createDocument(
    data: CreateDocumentDto,
    userId: string
  ): Promise<DocumentWithRelations> {
    try {
      const document = await prisma.document.create({
        data: {
          ...data,
          authorId: userId,
          // Generate embeddings for search
          embeddings: await this.generateEmbeddings(data.content),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Clear cache
      await this.clearCache(userId);

      // Track activity
      await this.trackActivity(document.id, 'CREATE', userId);

      return document;
    } catch (error) {
      logger.error('Failed to create document:', error);
      throw error;
    }
  }

  public async updateDocument(
    id: string,
    data: UpdateDocumentDto,
    userId: string
  ): Promise<DocumentWithRelations> {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
      });

      if (!document) {
        throw ApiError.notFound('Document not found');
      }

      if (document.authorId !== userId) {
        throw ApiError.forbidden('Not authorized to update this document');
      }

      const updated = await prisma.document.update({
        where: { id },
        data: {
          ...data,
          // Update embeddings if content changed
          ...(data.content && {
            embeddings: await this.generateEmbeddings(data.content),
          }),
          version: { increment: 1 },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Clear cache
      await this.clearCache(userId);
      await redis.del(`${this.CACHE_PREFIX}${id}`);

      // Track activity
      await this.trackActivity(id, 'UPDATE', userId);

      return updated;
    } catch (error) {
      logger.error('Failed to update document:', error);
      throw error;
    }
  }

  public async getDocument(
    id: string,
    userId: string
  ): Promise<DocumentWithRelations> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!document) {
        throw ApiError.notFound('Document not found');
      }

      if (!document.published && document.authorId !== userId) {
        throw ApiError.forbidden('Not authorized to view this document');
      }

      await redis.set(
        cacheKey,
        JSON.stringify(document),
        'EX',
        this.CACHE_TTL
      );

      // Track activity
      await this.trackActivity(id, 'VIEW', userId);

      return document;
    } catch (error) {
      logger.error('Failed to get document:', error);
      throw error;
    }
  }

  public async deleteDocument(id: string, userId: string): Promise<void> {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
      });

      if (!document) {
        throw ApiError.notFound('Document not found');
      }

      if (document.authorId !== userId) {
        throw ApiError.forbidden('Not authorized to delete this document');
      }

      await prisma.document.delete({
        where: { id },
      });

      // Clear cache
      await this.clearCache(userId);
      await redis.del(`${this.CACHE_PREFIX}${id}`);

      // Track activity
      await this.trackActivity(id, 'DELETE', userId);
    } catch (error) {
      logger.error('Failed to delete document:', error);
      throw error;
    }
  }

  public async searchDocuments(
    query: string,
    filter: DocumentFilter,
    userId: string
  ): Promise<DocumentWithRelations[]> {
    try {
      // Generate embeddings for search query
      const queryEmbeddings = await this.generateEmbeddings(query);

      // Perform vector similarity search
      const documents = await prisma.$queryRaw`
        SELECT d.*, 
          (d.embeddings <=> ${queryEmbeddings}) as similarity
        FROM "Document" d
        WHERE (d."authorId" = ${userId} OR d.published = true)
          ${filter.tags ? `AND d.tags @> ${filter.tags}` : ''}
        ORDER BY similarity DESC
        LIMIT ${filter.limit || 10}
        OFFSET ${filter.offset || 0}
      `;

      return documents;
    } catch (error) {
      logger.error('Failed to search documents:', error);
      throw error;
    }
  }

  private async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const embeddings = await aiService.generateEmbeddings(text);
      return embeddings;
    } catch (error) {
      logger.error('Failed to generate embeddings:', error);
      throw error;
    }
  }

  private async clearCache(userId: string): Promise<void> {
    const pattern = `${this.CACHE_PREFIX}user:${userId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await redis.del(keys);
    }
  }

  private async trackActivity(
    documentId: string,
    action: 'CREATE' | 'UPDATE' | 'VIEW' | 'DELETE',
    userId: string
  ): Promise<void> {
    try {
      await prisma.documentActivity.create({
        data: {
          documentId,
          userId,
          action,
        },
      });
    } catch (error) {
      logger.error('Failed to track activity:', error);
    }
  }
}

export const documentService = DocumentService.getInstance(); 