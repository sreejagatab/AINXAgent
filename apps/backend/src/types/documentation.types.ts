export enum DocRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  codeExamples?: {
    language: string;
    code: string;
    description?: string;
  }[];
  metadata?: Record<string, any>;
  pageId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocPage {
  id: string;
  title: string;
  description: string;
  sections: DocSection[];
  category: string;
  order: number;
  lastUpdated: Date;
  author?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocSearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface DocSearchResult {
  pages: DocPage[];
  total: number;
  page: number;
  limit: number;
}

export interface DocCacheKeys {
  page: (id: string) => string;
  allPages: string;
  sections: (tag: string) => string;
  search: (params: DocSearchParams) => string;
} 