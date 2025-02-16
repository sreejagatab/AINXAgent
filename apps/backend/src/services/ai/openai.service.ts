import OpenAI from 'openai';
import { PromptParameters, PromptExecutionResult } from '@enhanced-ai-agent/shared';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';

export class OpenAIService {
  private client: OpenAI;
  private monitor: PerformanceMonitor;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.monitor = PerformanceMonitor.getInstance('OpenAIService');
  }

  async execute(params: {
    prompt: string;
    parameters: PromptParameters;
  }): Promise<Omit<PromptExecutionResult, 'promptId' | 'input'>> {
    const startTime = Date.now();

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: params.prompt }],
        temperature: params.parameters.temperature,
        max_tokens: params.parameters.maxTokens,
        top_p: params.parameters.topP,
        frequency_penalty: params.parameters.frequencyPenalty,
        presence_penalty: params.parameters.presencePenalty,
        stop: params.parameters.stop,
      });

      const result = {
        model: completion.model,
        output: completion.choices[0].message.content || '',
        duration: Date.now() - startTime,
        tokenUsage: {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
        },
        success: true,
        metadata: {
          model: completion.model,
          systemFingerprint: completion.system_fingerprint,
          completionId: completion.id,
        },
      };

      this.monitor.recordMetric('openai_request_duration', result.duration);
      return result;
    } catch (error) {
      this.monitor.recordError('openai_request', error as Error);
      throw error;
    }
  }
} 