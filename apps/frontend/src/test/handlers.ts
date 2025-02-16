import { rest } from 'msw';
import { getEnvironment } from '../config/environment';

const baseUrl = getEnvironment().API_URL;

export const handlers = [
  // Auth handlers
  rest.post(`${baseUrl}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          token: 'mock-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            name: 'Test User',
          },
        },
      })
    );
  }),

  rest.post(`${baseUrl}/auth/register`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
        },
      })
    );
  }),

  // User handlers
  rest.get(`${baseUrl}/api/users/me`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            name: 'Test User',
          },
          preferences: {
            theme: 'light',
            language: 'en',
            emailNotifications: true,
            pushNotifications: false,
          },
        },
      })
    );
  }),

  // Prompt handlers
  rest.get(`${baseUrl}/api/prompts`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          prompts: [
            {
              id: '1',
              title: 'Test Prompt',
              description: 'Test Description',
              template: 'Test Template',
              userId: '1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          total: 1,
        },
      })
    );
  }),
]; 