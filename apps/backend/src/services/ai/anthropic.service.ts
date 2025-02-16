import Anthropic from '@anthropic-ai/sdk';
import { PromptParameters, PromptExecutionResult } from '@enhanced-ai-agent/shared';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';

export class AnthropicService {
  private client: Anthropic;
  private monitor: PerformanceMonitor;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.monitor = PerformanceMonitor.getInstance('AnthropicService');
  }

  async execute(params: {
    prompt: string;
    parameters: PromptParameters;
  }): Promise<Omit<PromptExecutionResult, 'promptId' | 'input'>> {
    const startTime = Date.now();

    try {
      const completion = await this.client.messages.create({
        model: 'claude-2',
        max_tokens: params.parameters.maxTokens,
        messages: [{ role: 'user', content: params.prompt }],
        temperature: params.parameters.temperature,
        top_p: params.parameters.topP,
      });

      // Estimate token usage since Anthropic doesn't provide it directly
      const promptTokens = Math.ceil(params.prompt.length / 4);
      const completionTokens = Math.ceil((completion.content[0].text || '').length / 4);

      const result = {
        model: 'claude-2',
        output: completion.content[0].text || '',
        duration: Date.now() - startTime,
        tokenUsage: {
          prompt: promptTokens,
          completion: completionTokens,
          total: promptTokens + completionTokens,
        },
        success: true,
        metadata: {
          model: completion.model,
          messageId: completion.id,
          role: completion.role,
        },
      };

      this.monitor.recordMetric('anthropic_request_duration', result.duration);
      return result;
    } catch (error) {
      this.monitor.recordError('anthropic_request', error as Error);
      throw error;
    }
  }
} 