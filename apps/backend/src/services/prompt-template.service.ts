import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import type { 
  PromptTemplate,
  PromptCategory,
  PromptVariable 
} from '../types/prompt.types';

export class PromptTemplateService {
  private static instance: PromptTemplateService;
  private readonly CACHE_PREFIX = 'prompt:';
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor() {}

  public static getInstance(): PromptTemplateService {
    if (!PromptTemplateService.instance) {
      PromptTemplateService.instance = new PromptTemplateService();
    }
    return PromptTemplateService.instance;
  }

  public async createTemplate(
    data: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PromptTemplate> {
    try {
      const template = await prisma.promptTemplate.create({
        data: {
          ...data,
          variables: this.extractVariables(data.content),
        },
      });

      await this.invalidateCache(template.category);
      return template;
    } catch (error) {
      logger.error('Failed to create prompt template:', error);
      throw error;
    }
  }

  public async updateTemplate(
    id: string,
    data: Partial<PromptTemplate>
  ): Promise<PromptTemplate> {
    try {
      const template = await prisma.promptTemplate.update({
        where: { id },
        data: {
          ...data,
          variables: data.content 
            ? this.extractVariables(data.content)
            : undefined,
        },
      });

      await this.invalidateCache(template.category);
      return template;
    } catch (error) {
      logger.error('Failed to update prompt template:', error);
      throw error;
    }
  }

  public async getTemplate(
    id: string
  ): Promise<PromptTemplate> {
    try {
      const template = await prisma.promptTemplate.findUnique({
        where: { id },
      });

      if (!template) {
        throw ApiError.notFound('Prompt template not found');
      }

      return template;
    } catch (error) {
      logger.error('Failed to get prompt template:', error);
      throw error;
    }
  }

  public async getTemplatesByCategory(
    category: PromptCategory
  ): Promise<PromptTemplate[]> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}category:${category}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const templates = await prisma.promptTemplate.findMany({
        where: { category },
        orderBy: { name: 'asc' },
      });

      await redis.set(
        cacheKey,
        JSON.stringify(templates),
        'EX',
        this.CACHE_TTL
      );

      return templates;
    } catch (error) {
      logger.error('Failed to get prompt templates by category:', error);
      throw error;
    }
  }

  public async deleteTemplate(id: string): Promise<void> {
    try {
      const template = await prisma.promptTemplate.delete({
        where: { id },
      });

      await this.invalidateCache(template.category);
    } catch (error) {
      logger.error('Failed to delete prompt template:', error);
      throw error;
    }
  }

  private extractVariables(content: string): PromptVariable[] {
    const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
    return [...new Set(matches)].map(match => ({
      name: match.replace(/[{}]/g, ''),
      required: !content.includes(`{{${match}?}}`),
    }));
  }

  private async invalidateCache(category: string): Promise<void> {
    try {
      await redis.del(`${this.CACHE_PREFIX}category:${category}`);
    } catch (error) {
      logger.error('Failed to invalidate cache:', error);
    }
  }
}

export const promptTemplateService = PromptTemplateService.getInstance(); 