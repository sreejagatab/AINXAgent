import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with placeholder text', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        placeholder="Test placeholder"
      />
    );

    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
  });

  it('should call onSearch when typing', async () => {
    jest.useFakeTimers();

    render(
      <SearchBar
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        debounceMs={300}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test');
    });

    jest.useRealTimers();
  });

  it('should call onClear when clicking clear button', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('should not show clear button when input is empty', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should focus input after clearing', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    expect(document.activeElement).toBe(input);
  });
}); 