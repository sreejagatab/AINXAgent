import { RenderResult } from '@testing-library/react';
import { Mock } from 'jest-mock';

export interface CustomRenderResult extends RenderResult {
  mockApis: Record<string, Mock>;
}

export interface TestWrapper {
  children: React.ReactNode;
}

export interface MockRouterOptions {
  pathname?: string;
  query?: Record<string, string>;
  asPath?: string;
}

export interface MockAuthOptions {
  isAuthenticated?: boolean;
  user?: Record<string, any>;
}

export interface MockApiOptions {
  status?: number;
  headers?: Record<string, string>;
}

export interface CustomMatchers<R = unknown> {
  toHaveBeenCalledWithMatch(...args: any[]): R;
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

export interface TestUtilsConfig {
  enableMockConsole?: boolean;
  enableMockMatchMedia?: boolean;
  enableMockIntersectionObserver?: boolean;
  enableMockResizeObserver?: boolean;
  enableMockFetch?: boolean;
  enableFakeTimers?: boolean;
  testTimeout?: number;
} 