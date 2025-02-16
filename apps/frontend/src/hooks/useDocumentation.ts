import { useState, useCallback, useEffect } from 'react';
import { documentationService } from '../services/documentation.service';
import { logger } from '../utils/logger';
import type { 
  DocPage, 
  DocSearchResult, 
  DocNavigationItem 
} from '../types/documentation.types';

export function useDocumentation() {
  const [currentPage, setCurrentPage] = useState<DocPage | null>(null);
  const [navigation, setNavigation] = useState<DocNavigationItem[]>([]);
  const [searchResults, setSearchResults] = useState<DocSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const page = await documentationService.getPage(id);
      if (page) {
        setCurrentPage(page);
      } else {
        setError('Page not found');
      }
    } catch (error) {
      const message = 'Failed to load documentation page';
      logger.error(message, { error, id });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const search = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await documentationService.search(query);
      setSearchResults(results);
    } catch (error) {
      const message = 'Failed to search documentation';
      logger.error(message, { error, query });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  useEffect(() => {
    return () => {
      setCurrentPage(null);
      setSearchResults([]);
      setError(null);
    };
  }, []);

  return {
    currentPage,
    navigation,
    searchResults,
    isLoading,
    error,
    loadPage,
    search,
    clearSearch,
  };
} 