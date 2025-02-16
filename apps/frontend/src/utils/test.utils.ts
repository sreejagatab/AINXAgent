import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ToastProvider } from '../contexts/ToastContext';
import { PersistenceProvider } from '../contexts/PersistenceContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialState?: Record<string, any>;
  mockApis?: Record<string, jest.Mock>;
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });
}

export function createWrapper() {
  const queryClient = createTestQueryClient();
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <PersistenceProvider storageKey="test" initialData={{}}>
              <ToastProvider>
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </ToastProvider>
            </PersistenceProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    route = '/',
    initialState = {},
    mockApis = {},
    ...renderOptions
  } = options;

  // Set up route
  window.history.pushState({}, 'Test page', route);

  // Set up initial state
  Object.entries(initialState).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  });

  // Set up API mocks
  Object.entries(mockApis).forEach(([path, mock]) => {
    jest.spyOn(global, 'fetch').mockImplementation((url: string) => {
      if (url.includes(path)) {
        return Promise.resolve(mock());
      }
      return Promise.reject(new Error(`No mock found for ${url}`));
    });
  });

  const wrapper = createWrapper();
  return {
    ...render(ui, { wrapper, ...renderOptions }),
    mockApis,
  };
}

export function mockConsole() {
  const originalConsole = { ...console };
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterAll(() => {
    Object.assign(console, originalConsole);
  });
}

export function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
} 