import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Document } from 'langchain/document';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { logger } from '../utils/logger';
import type { SearchResult } from '../types/ai.types';

export class VectorStoreService {
  private static instance: VectorStoreService;
  private vectorStore: HNSWLib | null = null;
  private embeddings: OpenAIEmbeddings;

  private constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.OPENAI_API_KEY,
    });
  }

  public static getInstance(): VectorStoreService {
    if (!VectorStoreService.instance) {
      VectorStoreService.instance = new VectorStoreService();
    }
    return VectorStoreService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.vectorStore = await HNSWLib.load(
        config.VECTOR_STORE_PATH,
        this.embeddings
      );
      logger.info('Vector store initialized');
    } catch (error) {
      logger.error('Failed to initialize vector store:', error);
      this.vectorStore = null;
    }
  }

  public async addDocument(
    content: string,
    metadata: Record<string, any>
  ): Promise<string> {
    if (!this.vectorStore) {
      await this.initialize();
    }

    try {
      const document = new Document({
        pageContent: content,
        metadata,
      });

      await this.vectorStore!.addDocuments([document]);
      await this.vectorStore!.save(config.VECTOR_STORE_PATH);

      return document.metadata.id;
    } catch (error) {
      logger.error('Failed to add document to vector store:', error);
      throw error;
    }
  }

  public async search(
    query: string,
    limit = 5
  ): Promise<SearchResult[]> {
    if (!this.vectorStore) {
      await this.initialize();
    }

    try {
      const results = await this.vectorStore!.similaritySearch(query, limit);
      
      return results.map(result => ({
        content: result.pageContent,
        metadata: result.metadata,
        score: result.metadata.score || 0,
      }));
    } catch (error) {
      logger.error('Vector store search failed:', error);
      throw error;
    }
  }

  public async deleteDocument(id: string): Promise<void> {
    if (!this.vectorStore) {
      await this.initialize();
    }

    try {
      await this.vectorStore!.delete({ id });
      await this.vectorStore!.save(config.VECTOR_STORE_PATH);
    } catch (error) {
      logger.error('Failed to delete document from vector store:', error);
      throw error;
    }
  }

  public async clear(): Promise<void> {
    try {
      this.vectorStore = await HNSWLib.fromTexts(
        [],
        [],
        this.embeddings
      );
      await this.vectorStore.save(config.VECTOR_STORE_PATH);
    } catch (error) {
      logger.error('Failed to clear vector store:', error);
      throw error;
    }
  }
}

export const vectorStoreService = VectorStoreService.getInstance(); 