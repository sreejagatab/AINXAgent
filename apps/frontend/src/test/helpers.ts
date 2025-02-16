import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';

export async function waitForLoadingToFinish() {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    jest.runAllTimers();
  });
}

export function createMockQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });
}

export function createMockRouter(options: {
  pathname?: string;
  query?: Record<string, string>;
  asPath?: string;
} = {}) {
  return {
    pathname: options.pathname || '/',
    query: options.query || {},
    asPath: options.asPath || '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
  };
}

export function createMockAuthState(options: {
  isAuthenticated?: boolean;
  user?: Record<string, any>;
} = {}) {
  return {
    isAuthenticated: options.isAuthenticated ?? false,
    user: options.user ?? null,
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn(),
    updateProfile: jest.fn(),
  };
}

export const mockApiResponse = (data: any, options: {
  status?: number;
  headers?: Record<string, string>;
} = {}) => {
  return Promise.resolve({
    ok: true,
    status: options.status || 200,
    headers: new Headers(options.headers || {
      'Content-Type': 'application/json',
    }),
    json: () => Promise.resolve(data),
  });
};

export const mockApiError = (error: any, status = 400) => {
  return Promise.resolve({
    ok: false,
    status,
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    json: () => Promise.resolve(error),
  });
};

export const user = userEvent.setup();

export const mockDate = (isoDate: string) => {
  const mockDate = new Date(isoDate);
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
}; 