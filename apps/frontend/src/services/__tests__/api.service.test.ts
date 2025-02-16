import { apiService } from '../api.service';
import { server } from '../../test/mocks/server';
import { rest } from 'msw';
import { API_BASE_URL } from '../../config';
import { mockPrompts, mockTools } from '../../test/mocks/mockData';

describe('API Service', () => {
  beforeAll(() => {
    // Setup default auth token
    localStorage.setItem('auth_token', 'mock-jwt-token');
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    localStorage.clear();
  });

  describe('Prompts API', () => {
    it('should fetch prompts successfully', async () => {
      const prompts = await apiService.getPrompts();
      expect(prompts).toEqual(mockPrompts);
    });

    it('should filter prompts by category', async () => {
      const category = 'development';
      const prompts = await apiService.getPrompts({ category });
      expect(prompts).toEqual(
        mockPrompts.filter(p => p.category === category)
      );
    });

    it('should handle API errors', async () => {
      server.use(
        rest.get(`${API_BASE_URL}/prompts`, (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ message: 'Internal server error' })
          );
        })
      );

      await expect(apiService.getPrompts()).rejects.toThrow(
        'Failed to fetch prompts'
      );
    });
  });

  describe('Tools API', () => {
    it('should execute tool successfully', async () => {
      const toolId = '1';
      const params = { code: 'console.log("test")', language: 'javascript' };
      
      const result = await apiService.executeTool(toolId, params);
      
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('metadata');
    });

    it('should handle tool not found', async () => {
      const toolId = 'invalid-id';
      const params = {};

      await expect(
        apiService.executeTool(toolId, params)
      ).rejects.toThrow('Tool not found');
    });
  });

  describe('Evaluations API', () => {
    it('should create evaluation successfully', async () => {
      const promptId = '1';
      const response = 'Test response';

      const evaluation = await apiService.createEvaluation(promptId, response);

      expect(evaluation).toHaveProperty('scores');
      expect(evaluation).toHaveProperty('suggestions');
      expect(evaluation.promptId).toBe(promptId);
      expect(evaluation.response).toBe(response);
    });
  });
}); 