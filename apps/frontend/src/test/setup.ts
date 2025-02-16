import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// Mock matchMedia
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

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

// Global test timeout
jest.setTimeout(10000);

// Mock fetch
global.fetch = jest.fn();

// Add custom matchers
expect.extend({
  toHaveBeenCalledWithMatch(received: jest.Mock, ...expectedArgs: any[]) {
    const calls = received.mock.calls;
    const match = calls.some(call =>
      expectedArgs.every((arg, index) =>
        this.equals(call[index], arg)
      )
    );

    return {
      pass: match,
      message: () =>
        `expected ${received.getMockName()} to have been called with arguments matching ${expectedArgs.join(', ')}`,
    };
  },
}); 