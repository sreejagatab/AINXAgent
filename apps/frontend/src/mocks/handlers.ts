import { rest } from 'msw';
import { getEnvironment } from '../config/environment';

const API_URL = getEnvironment().API_URL;

export const handlers = [
  // Auth handlers
  rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
    const { username, password } = req.body as any;

    if (username === 'testuser' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'mock-jwt-token',
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user',
          },
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({
        message: 'Invalid credentials',
      })
    );
  }),

  // User handlers
  rest.get(`${API_URL}/users/me`, (req, res, ctx) => {
    const auth = req.headers.get('Authorization');

    if (!auth || !auth.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          message: 'Unauthorized',
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      })
    );
  }),

  // API health check
  rest.get(`${API_URL}/health`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
      })
    );
  }),

  // Fallback handler for unhandled requests
  rest.all('*', (req, res, ctx) => {
    console.warn('Unhandled request:', req.method, req.url.toString());
    return res(
      ctx.status(404),
      ctx.json({
        message: 'Not Found',
      })
    );
  }),
]; 