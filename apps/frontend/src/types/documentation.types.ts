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
}

export interface DocPage {
  id: string;
  title: string;
  description: string;
  sections: DocSection[];
  category: string;
  order: number;
  lastUpdated: string;
  author?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface DocSearchResult {
  page: DocPage;
  relevance: number;
  matchedTerms: string[];
}

export interface DocNavigationItem {
  id: string;
  title: string;
  path: string;
  children?: DocNavigationItem[];
}

export interface DocState {
  currentPage: DocPage | null;
  navigation: DocNavigationItem[];
  searchResults: DocSearchResult[];
  isLoading: boolean;
  error: string | null;
}

export interface DocActions {
  loadPage: (id: string) => Promise<void>;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export type DocContextType = DocState & DocActions; 