import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentationContext } from '../contexts/DocumentationContext';
import { CodeBlock } from './CodeBlock';
import { SearchBar } from './SearchBar';
import { Spinner } from './Spinner';
import { formatDate } from '../utils/format';

export const Documentation: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const {
    currentPage,
    searchResults,
    isLoading,
    error,
    loadPage,
    search,
    clearSearch,
  } = useDocumentationContext();

  useEffect(() => {
    if (pageId) {
      loadPage(pageId);
    }
  }, [pageId, loadPage]);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/docs')}>Return to Documentation</button>
      </div>
    );
  }

  return (
    <div className="documentation">
      <div className="doc-header">
        <SearchBar
          onSearch={search}
          onClear={clearSearch}
          placeholder="Search documentation..."
        />
      </div>

      {searchResults.length > 0 ? (
        <div className="search-results">
          <h2>Search Results</h2>
          {searchResults.map(({ page, relevance, matchedTerms }) => (
            <div key={page.id} className="search-result">
              <h3>
                <a href={`/docs/${page.id}`}>{page.title}</a>
              </h3>
              <p>{page.description}</p>
              <div className="search-meta">
                <span>Relevance: {Math.round(relevance * 100)}%</span>
                <span>Matched: {matchedTerms.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : currentPage ? (
        <article className="doc-content">
          <header>
            <h1>{currentPage.title}</h1>
            <p className="doc-meta">
              {currentPage.author && <span>By {currentPage.author}</span>}
              <span>Last updated: {formatDate(currentPage.lastUpdated)}</span>
            </p>
            <p className="doc-description">{currentPage.description}</p>
          </header>

          {currentPage.sections.map(section => (
            <section key={section.id} id={section.id} className="doc-section">
              <h2>{section.title}</h2>
              <div className="doc-section-content">
                {section.content}
                {section.codeExamples?.map((example, index) => (
                  <div key={index} className="code-example">
                    {example.description && (
                      <p className="code-description">{example.description}</p>
                    )}
                    <CodeBlock
                      code={example.code}
                      language={example.language}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </article>
      ) : (
        <div className="doc-empty">
          <h2>Select a documentation page</h2>
          <p>Choose a page from the navigation menu to get started.</p>
        </div>
      )}
    </div>
  );
}; 