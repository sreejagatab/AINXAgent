import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { logger } from '../../utils/logger';
import { ApiError } from '../../utils/errors';
import { validateToolConfig } from '../../utils/validation';
import type { Tool, ToolExecution } from '../../types/tool.types';

export class ToolService {
  private static instance: ToolService;
  private readonly CACHE_PREFIX = 'tool:';
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor() {}

  public static getInstance(): ToolService {
    if (!ToolService.instance) {
      ToolService.instance = new ToolService();
    }
    return ToolService.instance;
  }

  public async createTool(data: {
    name: string;
    description?: string;
    type: string;
    parameters: Record<string, any>;
    isPublic?: boolean;
    userId: string;
  }) {
    try {
      // Validate tool configuration
      validateToolConfig(data.type, data.parameters);

      const tool = await prisma.tool.create({
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          parameters: data.parameters,
          isPublic: data.isPublic ?? false,
          userId: data.userId,
        },
      });

      await this.cacheTool(tool.id, tool);
      return tool;
    } catch (error) {
      logger.error('Error creating tool:', error);
      throw error;
    }
  }

  public async getTools(params: {
    userId?: string;
    type?: string;
    isPublic?: boolean;
  }) {
    try {
      const where: any = {};
      
      if (params.userId) {
        where.OR = [
          { userId: params.userId },
          { isPublic: true },
        ];
      } else {
        where.isPublic = true;
      }

      if (params.type) {
        where.type = params.type;
      }

      return await prisma.tool.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error fetching tools:', error);
      throw error;
    }
  }

  public async getToolById(id: string, userId?: string) {
    try {
      // Try cache first
      const cached = await this.getCachedTool(id);
      if (cached) {
        return this.validateAccess(cached, userId);
      }

      const tool = await prisma.tool.findUnique({
        where: { id },
      });

      if (!tool) {
        throw new ApiError('Tool not found', 404);
      }

      // Validate access
      const validatedTool = this.validateAccess(tool, userId);

      // Cache for next time
      await this.cacheTool(id, tool);

      return validatedTool;
    } catch (error) {
      logger.error('Error fetching tool:', error);
      throw error;
    }
  }

  public async updateTool(
    id: string,
    updates: Partial<Tool>,
    userId: string
  ) {
    try {
      const tool = await prisma.tool.findUnique({
        where: { id },
      });

      if (!tool) {
        throw new ApiError('Tool not found', 404);
      }

      if (tool.userId !== userId) {
        throw new ApiError('Unauthorized to update tool', 403);
      }

      // Validate updated configuration if parameters changed
      if (updates.parameters) {
        validateToolConfig(updates.type || tool.type, updates.parameters);
      }

      const updatedTool = await prisma.tool.update({
        where: { id },
        data: updates,
      });

      await this.cacheTool(id, updatedTool);
      return updatedTool;
    } catch (error) {
      logger.error('Error updating tool:', error);
      throw error;
    }
  }

  public async deleteTool(id: string, userId: string) {
    try {
      const tool = await prisma.tool.findUnique({
        where: { id },
      });

      if (!tool) {
        throw new ApiError('Tool not found', 404);
      }

      if (tool.userId !== userId) {
        throw new ApiError('Unauthorized to delete tool', 403);
      }

      await prisma.tool.delete({
        where: { id },
      });

      await this.invalidateCache(id);
    } catch (error) {
      logger.error('Error deleting tool:', error);
      throw error;
    }
  }

  public async executeTool(
    id: string,
    executionData: ToolExecution,
    userId: string
  ) {
    try {
      const tool = await this.getToolById(id, userId);
      
      // Validate execution parameters
      this.validateExecutionParameters(tool, executionData);

      // Execute tool based on type
      const result = await this.executeToolByType(tool, executionData);

      // Track execution
      await this.trackExecution(tool.id, userId, executionData, result);

      return result;
    } catch (error) {
      logger.error('Error executing tool:', error);
      throw error;
    }
  }

  private async cacheTool(id: string, tool: any) {
    await redis.set(
      `${this.CACHE_PREFIX}${id}`,
      JSON.stringify(tool),
      { ttl: this.CACHE_TTL }
    );
  }

  private async getCachedTool(id: string) {
    const cached = await redis.get(`${this.CACHE_PREFIX}${id}`);
    return cached ? JSON.parse(cached) : null;
  }

  private async invalidateCache(id: string) {
    await redis.del(`${this.CACHE_PREFIX}${id}`);
  }

  private validateAccess(tool: any, userId?: string): any {
    if (!tool.isPublic && tool.userId !== userId) {
      throw new ApiError('Unauthorized to access tool', 403);
    }
    return tool;
  }

  private validateExecutionParameters(tool: Tool, execution: ToolExecution) {
    const requiredParams = Object.entries(tool.parameters)
      .filter(([_, config]) => config.required)
      .map(([name]) => name);

    for (const param of requiredParams) {
      if (!(param in execution.parameters)) {
        throw new ApiError(`Missing required parameter: ${param}`, 400);
      }
    }
  }

  private async executeToolByType(tool: Tool, execution: ToolExecution) {
    // Implement different tool types here
    switch (tool.type) {
      case 'http':
        return this.executeHttpTool(tool, execution);
      case 'database':
        return this.executeDatabaseTool(tool, execution);
      case 'function':
        return this.executeFunctionTool(tool, execution);
      default:
        throw new ApiError(`Unsupported tool type: ${tool.type}`, 400);
    }
  }

  private async trackExecution(
    toolId: string,
    userId: string,
    execution: ToolExecution,
    result: any
  ) {
    try {
      await prisma.toolExecution.create({
        data: {
          toolId,
          userId,
          parameters: execution.parameters,
          result,
          status: 'success',
          executionTime: Date.now(),
        },
      });
    } catch (error) {
      logger.error('Error tracking tool execution:', error);
    }
  }

  // Implement specific tool type executions
  private async executeHttpTool(tool: Tool, execution: ToolExecution) {
    // Implement HTTP tool execution
    throw new Error('Not implemented');
  }

  private async executeDatabaseTool(tool: Tool, execution: ToolExecution) {
    // Implement database tool execution
    throw new Error('Not implemented');
  }

  private async executeFunctionTool(tool: Tool, execution: ToolExecution) {
    // Implement function tool execution
    throw new Error('Not implemented');
  }
}

export const toolService = ToolService.getInstance(); 