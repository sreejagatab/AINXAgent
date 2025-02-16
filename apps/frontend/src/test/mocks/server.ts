import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// Add type augmentation for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveErrorMessage(message: string): R;
    }
  }
}

// Add request handlers
export const addHandlers = (...newHandlers: any[]) => {
  server.use(...newHandlers);
};

// Reset handlers
export const resetHandlers = () => {
  server.resetHandlers();
  server.use(...handlers);
};

// Listen for unhandled requests
server.listen({
  onUnhandledRequest: (req) => {
    console.error(
      `Found an unhandled ${req.method} request to ${req.url.href}`
    );
  },
}); 