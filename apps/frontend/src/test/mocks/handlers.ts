import { rest } from 'msw';
import { API_BASE_URL } from '../../config';
import { mockPrompts, mockTools, mockEvaluations } from './mockData';

export const handlers = [
  // Auth endpoints
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body as any;
    
    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'mock-jwt-token',
          user: {
            id: '1',
            email: 'test@example.com',
            role: 'user',
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ message: 'Invalid credentials' })
    );
  }),

  // Prompts endpoints
  rest.get(`${API_BASE_URL}/prompts`, (req, res, ctx) => {
    const category = req.url.searchParams.get('category');
    let prompts = mockPrompts;
    
    if (category) {
      prompts = prompts.filter(p => p.category === category);
    }
    
    return res(ctx.status(200), ctx.json(prompts));
  }),

  // Tools endpoints
  rest.get(`${API_BASE_URL}/tools`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockTools));
  }),

  rest.post(`${API_BASE_URL}/tools/execute`, (req, res, ctx) => {
    const { toolId, params } = req.body as any;
    const tool = mockTools.find(t => t.id === toolId);
    
    if (!tool) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Tool not found' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        result: `Executed ${tool.name} with params: ${JSON.stringify(params)}`,
        metadata: {
          duration: 1200,
          status: 'success',
        },
      })
    );
  }),

  // Evaluations endpoints
  rest.post(`${API_BASE_URL}/evaluations`, (req, res, ctx) => {
    const { promptId, response } = req.body as any;
    const evaluation = mockEvaluations[0];
    
    return res(
      ctx.status(200),
      ctx.json({
        ...evaluation,
        promptId,
        response,
        timestamp: new Date().toISOString(),
      })
    );
  }),
]; 