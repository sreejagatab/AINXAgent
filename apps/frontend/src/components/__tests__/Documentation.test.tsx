import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Documentation } from '../Documentation';
import { DocumentationProvider } from '../../contexts/DocumentationContext';
import { documentationService } from '../../services/documentation.service';

jest.mock('../../services/documentation.service');

const mockDocPage = {
  id: 'test-page',
  title: 'Test Page',
  description: 'Test Description',
  sections: [
    {
      id: 'section-1',
      title: 'Section 1',
      content: 'Test Content',
      order: 0,
    },
  ],
  category: 'test',
  order: 0,
  lastUpdated: new Date().toISOString(),
};

describe('Documentation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (pageId?: string) => {
    return render(
      <MemoryRouter initialEntries={[`/docs${pageId ? `/${pageId}` : ''}`]}>
        <DocumentationProvider>
          <Routes>
            <Route path="/docs" element={<Documentation />}>
              <Route path=":pageId" element={<Documentation />} />
            </Route>
          </Routes>
        </DocumentationProvider>
      </MemoryRouter>
    );
  };

  it('should render loading state initially', () => {
    jest.spyOn(documentationService, 'getPage').mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockDocPage), 100))
    );

    renderComponent('test-page');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render page content when loaded', async () => {
    jest.spyOn(documentationService, 'getPage').mockResolvedValue(mockDocPage);

    renderComponent('test-page');

    await waitFor(() => {
      expect(screen.getByText(mockDocPage.title)).toBeInTheDocument();
      expect(screen.getByText(mockDocPage.description)).toBeInTheDocument();
      expect(screen.getByText(mockDocPage.sections[0].content)).toBeInTheDocument();
    });
  });

  it('should render error message when page fails to load', async () => {
    jest.spyOn(documentationService, 'getPage').mockRejectedValue(new Error('Failed to load'));

    renderComponent('test-page');

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('should handle search functionality', async () => {
    const mockSearchResults = [
      {
        page: mockDocPage,
        relevance: 1,
        matchedTerms: ['test'],
      },
    ];

    jest.spyOn(documentationService, 'search').mockResolvedValue(mockSearchResults);

    renderComponent();

    const searchInput = screen.getByPlaceholderText(/search documentation/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText(mockDocPage.title)).toBeInTheDocument();
    });
  });

  it('should clear search results', async () => {
    const mockSearchResults = [
      {
        page: mockDocPage,
        relevance: 1,
        matchedTerms: ['test'],
      },
    ];

    jest.spyOn(documentationService, 'search').mockResolvedValue(mockSearchResults);

    renderComponent();

    const searchInput = screen.getByPlaceholderText(/search documentation/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));

    await waitFor(() => {
      expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
    });
  });
}); 