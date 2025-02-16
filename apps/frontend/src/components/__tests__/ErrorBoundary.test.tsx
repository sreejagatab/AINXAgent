import React from 'react';
import { screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { renderWithProviders } from '../../utils/test.utils';
import { errorService } from '../../services/error.service';

jest.mock('../../services/error.service');

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when an error occurs', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithProviders(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/please try again/i)).toBeInTheDocument();
    expect(errorService.handleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('calls onError prop when an error occurs', () => {
    const onError = jest.fn();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );

    consoleError.mockRestore();
  });

  it('resets error state when clicking try again button', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onReset = jest.fn();

    renderWithProviders(
      <ErrorBoundary onReset={onReset}>
        <ThrowError />
      </ErrorBoundary>
    );

    await screen.findByText('Try Again');
    screen.getByText('Try Again').click();

    expect(onReset).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const fallback = <div>Custom error message</div>;
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(
      <ErrorBoundary fallback={fallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();

    consoleError.mockRestore();
  });
}); 