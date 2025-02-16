import { store } from '../store';
import { storage } from './storage';
import { getEnvironment } from '../config/environment';

export const mockAuthState = {
  token: 'mock-jwt-token',
  user: {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
  },
  isAuthenticated: true,
  loading: false,
  error: null,
};

export function setupAuthenticatedTest() {
  storage.setItem('token', mockAuthState.token);
  store.dispatch({ type: 'auth/loginSuccess', payload: mockAuthState });
}

export function cleanupAuthenticatedTest() {
  storage.clearAll();
  store.dispatch({ type: 'auth/logout' });
}

export function mockApiResponse<T>(data: T, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    headers: new Headers(),
  };
}

export function mockApiError(message: string, status = 400) {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ message }),
    headers: new Headers(),
  };
}

export const mockEnvironment = {
  ...getEnvironment(),
  isProduction: false,
  API_URL: 'http://localhost:3000/api',
  WS_URL: 'ws://localhost:3000',
};

export function createMockWebSocket() {
  const mockWs = {
    readyState: WebSocket.CONNECTING,
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  // Simulate WebSocket connection
  setTimeout(() => {
    mockWs.readyState = WebSocket.OPEN;
    const event = new Event('open');
    mockWs.addEventListener.mock.calls
      .filter(([type]) => type === 'open')
      .forEach(([, handler]) => handler(event));
  }, 0);

  return mockWs;
} 