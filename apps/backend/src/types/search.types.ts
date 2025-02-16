import type { Document } from '@prisma/client';

export interface SearchQuery {
  text: string;
  type?: 'semantic' | 'fulltext' | 'hybrid';
  fields?: string[];
}

export interface SearchFilter {
  tags?: string[];
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult extends Document {
  textRank: number;
  semanticRank: number;
  highlights?: {
    field: string;
    snippet: string;
  }[];
}

export interface SearchSuggestion {
  text: string;
  score: number;
  type: 'term' | 'phrase' | 'document';
}

export interface SearchStats {
  topQueries: Array<{
    query: string;
    count: number;
  }>;
}

export interface SearchMetrics {
  id: string;
  userId: string;
  query: string;
  resultCount: number;
  duration: number;
  createdAt: Date;
}

export interface SearchAnalytics {
  totalSearches: number;
  averageResults: number;
  averageDuration: number;
  popularQueries: Array<{
    query: string;
    count: number;
    avgResults: number;
  }>;
  queryDistribution: Record<string, number>;
} 