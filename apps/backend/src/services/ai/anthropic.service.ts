import { Anthropic } from '@anthropic-ai/sdk';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { ApiError } from '../../utils/errors';
import type { 
  AIModelConfig,
  CompletionRequest,
  AIResponse,
  ChatMessage 
} from '../../types/ai.types';

export class AnthropicService {
  private static instance: AnthropicService;
  private anthropic: Anthropic;
  private modelConfig: Record<string, AIModelConfig>;

  private constructor() {
    this.anthropic = new Anthropic({
      apiKey: config.ai.anthropic.apiKey,
    });
    this.initializeModelConfigs();
  }

  public static getInstance(): AnthropicService {
    if (!AnthropicService.instance) {
      AnthropicService.instance = new AnthropicService();
    }
    return AnthropicService.instance;
  }

  private initializeModelConfigs() {
    this.modelConfig = {
      'claude-2': {
        model: 'claude-2',
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
      },
      'claude-instant': {
        model: 'claude-instant',
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
      },
    };
  }

  private formatMessages(messages: ChatMessage[]): string {
    return messages.map(msg => {
      switch (msg.role) {
        case 'system':
          return `\n\nSystem: ${msg.content}`;
        case 'assistant':
          return `\n\nAssistant: ${msg.content}`;
        case 'user':
        default:
          return `\n\nHuman: ${msg.content}`;
      }
    }).join('');
  }

  public async generateCompletion(
    request: CompletionRequest
  ): Promise<AIResponse<string>> {
    try {
      const modelConfig = this.modelConfig[request.model] || this.modelConfig['claude-2'];
      const formattedPrompt = this.formatMessages(request.messages);

      const completion = await this.anthropic.messages.create({
        model: request.model,
        messages: [{ role: 'user', content: formattedPrompt }],
        max_tokens: request.maxTokens ?? modelConfig.maxTokens,
        temperature: request.temperature ?? modelConfig.temperature,
      });

      return {
        data: completion.content[0].text,
        usage: {
          promptTokens: 0, // Anthropic doesn't provide token counts
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error: any) {
      logger.error('Anthropic completion error:', error);
      throw new ApiError(
        error.message || 'Anthropic service error',
        error.status || 500
      );
    }
  }

  public async streamCompletion(
    request: CompletionRequest,
    onData: (data: string) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      const modelConfig = this.modelConfig[request.model] || this.modelConfig['claude-2'];
      const formattedPrompt = this.formatMessages(request.messages);

      const stream = await this.anthropic.messages.create({
        model: request.model,
        messages: [{ role: 'user', content: formattedPrompt }],
        max_tokens: request.maxTokens ?? modelConfig.maxTokens,
        temperature: request.temperature ?? modelConfig.temperature,
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.content[0].text) {
          onData(chunk.content[0].text);
        }
      }

      onComplete();
    } catch (error: any) {
      logger.error('Anthropic streaming error:', error);
      throw new ApiError(
        error.message || 'Anthropic streaming error',
        error.status || 500
      );
    }
  }
}

export const anthropicService = AnthropicService.getInstance(); 