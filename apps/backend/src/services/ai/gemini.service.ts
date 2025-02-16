import { GoogleGenerativeAI } from '@google/generative-ai';
import { PromptParameters, PromptExecutionResult } from '@enhanced-ai-agent/shared';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';

export class GeminiService {
  private client: GoogleGenerativeAI;
  private monitor: PerformanceMonitor;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.monitor = PerformanceMonitor.getInstance('GeminiService');
  }

  async execute(params: {
    prompt: string;
    parameters: PromptParameters;
  }): Promise<Omit<PromptExecutionResult, 'promptId' | 'input'>> {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
        generationConfig: {
          temperature: params.parameters.temperature,
          topP: params.parameters.topP,
          maxOutputTokens: params.parameters.maxTokens,
        },
      });

      const response = result.response;
      const text = response.text();

      // Estimate token usage since Gemini doesn't provide it directly
      const promptTokens = Math.ceil(params.prompt.length / 4);
      const completionTokens = Math.ceil(text.length / 4);

      const executionResult = {
        model: 'gemini-pro',
        output: text,
        duration: Date.now() - startTime,
        tokenUsage: {
          prompt: promptTokens,
          completion: completionTokens,
          total: promptTokens + completionTokens,
        },
        success: true,
        metadata: {
          model: 'gemini-pro',
          promptFeedback: response.promptFeedback,
          finishReason: response.candidates?.[0]?.finishReason,
        },
      };

      this.monitor.recordMetric('gemini_request_duration', executionResult.duration);
      return executionResult;
    } catch (error) {
      this.monitor.recordError('gemini_request', error as Error);
      throw error;
    }
  }
} 