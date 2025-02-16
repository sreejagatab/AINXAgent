import React, { useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { Icon } from './Icon';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  placeholder = 'Search...',
  debounceMs = 300,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      if (value.trim()) {
        onSearch(value);
      } else {
        onClear();
      }
    }, debounceMs),
    [onSearch, onClear, debounceMs]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar">
      <Icon name="search" className="search-icon" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="search-input"
      />
      {query && (
        <button onClick={handleClear} className="clear-button">
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}; 