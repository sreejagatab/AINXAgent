import { ApiResponse, Prompt } from '@enhanced-ai-agent/shared';
import { api } from './api';

export class PromptService {
  private static instance: PromptService;
  private baseUrl = '/api/prompts';

  private constructor() {}

  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  async getPrompts(filters?: any): Promise<ApiResponse<Prompt[]>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value as string);
        }
      });
    }

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    return api.get(url);
  }

  async getPromptById(id: string): Promise<ApiResponse<Prompt>> {
    return api.get(`${this.baseUrl}/${id}`);
  }

  async createPrompt(data: Partial<Prompt>): Promise<ApiResponse<Prompt>> {
    return api.post(this.baseUrl, data);
  }

  async updatePrompt(id: string, data: Partial<Prompt>): Promise<ApiResponse<Prompt>> {
    return api.put(`${this.baseUrl}/${id}`, data);
  }

  async deletePrompt(id: string): Promise<ApiResponse<void>> {
    return api.delete(`${this.baseUrl}/${id}`);
  }

  async executePrompt(
    id: string,
    input: string,
    options?: any
  ): Promise<ApiResponse<any>> {
    return api.post(`${this.baseUrl}/${id}/execute`, { input, options });
  }

  async validatePrompt(data: Partial<Prompt>): Promise<ApiResponse<any>> {
    return api.post(`${this.baseUrl}/validate`, data);
  }
} 