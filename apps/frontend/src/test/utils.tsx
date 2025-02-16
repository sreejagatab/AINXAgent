import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import rootReducer from '../store/rootReducer';
import type { RootState } from '../store/types';

interface WrapperProps {
  children: React.ReactNode;
  initialState?: Partial<RootState>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    initialState = {},
    store = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: WrapperProps) {
    return (
      <Provider store={store}>
        <ThemeProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </Provider>
    );
  }

  return {
    store,
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export * from '@testing-library/react';
export { renderWithProviders as render };

// Custom test matchers
expect.extend({
  toHaveErrorMessage(received: HTMLElement, expectedMessage: string) {
    const errorMessage = received.getAttribute('aria-errormessage');
    const pass = errorMessage === expectedMessage;

    return {
      pass,
      message: () =>
        `Expected element to ${pass ? 'not ' : ''}have error message: ${expectedMessage}`,
    };
  },
}); 