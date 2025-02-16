import React, { PropsWithChildren } from 'react';
import { render as rtlRender } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ErrorProvider } from '../contexts/ErrorContext';
import { PerformanceProvider } from '../contexts/PerformanceContext';
import rootReducer from '../store/rootReducer';
import { ThemeProvider } from '../contexts/ThemeContext';

interface WrapperProps {
  initialState?: Record<string, any>;
  store?: any;
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
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider>
            <ErrorProvider>
              <PerformanceProvider>
                {children}
              </PerformanceProvider>
            </ErrorProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  }

  return {
    store,
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export function createMockStore(initialState = {}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });
}

export * from '@testing-library/react';
export { renderWithProviders as render }; 