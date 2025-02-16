export type VectorDocument = {
  id: string;
  content: string;
  metadata?: VectorMetadata;
};

export type VectorMetadata = {
  type?: string;
  tags?: string[];
  language?: string;
  author?: string;
  createdAt?: Date;
  [key: string]: any;
};

export type VectorSearchOptions = {
  limit?: number;
  threshold?: number;
  filters?: Partial<VectorMetadata>;
};

export type VectorSearchResult = {
  documentId: string;
  similarity: number;
  metadata?: VectorMetadata;
};

export type VectorIndex = {
  id: string;
  documentId: string;
  embedding: number[];
  metadata: VectorMetadata;
  createdAt: Date;
  updatedAt: Date;
};

export type VectorStats = {
  totalDocuments: number;
  averageEmbeddingSize: number;
  languageDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  updatedAt: Date;
};

export type VectorOperation = {
  id: string;
  type: 'index' | 'delete' | 'update';
  documentId: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  completedAt?: Date;
};

export interface VectorStore {
  index(document: VectorDocument): Promise<void>;
  search(query: string, options?: VectorSearchOptions): Promise<VectorSearchResult[]>;
  delete(documentId: string): Promise<void>;
  updateMetadata(documentId: string, metadata: VectorMetadata): Promise<void>;
  getStats(): Promise<VectorStats>;
} 