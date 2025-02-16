import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { aiService } from './ai.service';
import { logger } from '../utils/logger';
import { config } from '../config';
import type { 
  VectorSearchResult,
  VectorSearchOptions,
  VectorDocument,
  VectorMetadata 
} from '../types/vector-search.types';

export class VectorSearchService {
  private static instance: VectorSearchService;
  private readonly CACHE_PREFIX = 'vector:';
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly SIMILARITY_THRESHOLD = 0.8;

  private constructor() {}

  public static getInstance(): VectorSearchService {
    if (!VectorSearchService.instance) {
      VectorSearchService.instance = new VectorSearchService();
    }
    return VectorSearchService.instance;
  }

  public async indexDocument(
    document: VectorDocument
  ): Promise<void> {
    try {
      const embeddings = await aiService.generateEmbeddings([
        document.content,
      ]);

      await prisma.vectorIndex.create({
        data: {
          documentId: document.id,
          embedding: embeddings.embeddings[0],
          metadata: document.metadata,
        },
      });

      logger.info(`Indexed document: ${document.id}`);
    } catch (error) {
      logger.error('Failed to index document:', error);
      throw error;
    }
  }

  public async search(
    query: string,
    options: VectorSearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    try {
      const {
        limit = 10,
        threshold = this.SIMILARITY_THRESHOLD,
        filters = {},
      } = options;

      // Generate query embedding
      const embeddings = await aiService.generateEmbeddings([query]);
      const queryEmbedding = embeddings.embeddings[0];

      // Perform vector similarity search
      const results = await prisma.$queryRaw`
        SELECT 
          "documentId",
          "metadata",
          1 - (embedding <-> ${queryEmbedding}::vector) as similarity
        FROM "VectorIndex"
        WHERE 1 - (embedding <-> ${queryEmbedding}::vector) > ${threshold}
        AND metadata @> ${JSON.stringify(filters)}::jsonb
        ORDER BY similarity DESC
        LIMIT ${limit}
      `;

      return results.map((result: any) => ({
        documentId: result.documentId,
        similarity: result.similarity,
        metadata: result.metadata,
      }));
    } catch (error) {
      logger.error('Vector search failed:', error);
      throw error;
    }
  }

  public async deleteDocument(documentId: string): Promise<void> {
    try {
      await prisma.vectorIndex.delete({
        where: { documentId },
      });

      logger.info(`Deleted document from vector index: ${documentId}`);
    } catch (error) {
      logger.error('Failed to delete document from vector index:', error);
      throw error;
    }
  }

  public async updateMetadata(
    documentId: string,
    metadata: VectorMetadata
  ): Promise<void> {
    try {
      await prisma.vectorIndex.update({
        where: { documentId },
        data: { metadata },
      });

      logger.info(`Updated metadata for document: ${documentId}`);
    } catch (error) {
      logger.error('Failed to update document metadata:', error);
      throw error;
    }
  }

  public async reindexAll(): Promise<void> {
    try {
      const documents = await prisma.document.findMany({
        select: {
          id: true,
          content: true,
          metadata: true,
        },
      });

      for (const doc of documents) {
        await this.indexDocument({
          id: doc.id,
          content: doc.content,
          metadata: doc.metadata,
        });
      }

      logger.info(`Reindexed ${documents.length} documents`);
    } catch (error) {
      logger.error('Failed to reindex documents:', error);
      throw error;
    }
  }
}

export const vectorSearchService = VectorSearchService.getInstance(); 