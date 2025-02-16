export * from './validation';
export * from './formatting';
export * from './security';
export * from './performance';

import { PromptParameters, AIModel } from '../types';

export class PromptUtils {
  static validateParameters(params: PromptParameters): boolean {
    return (
      params.temperature >= 0 &&
      params.temperature <= 1 &&
      params.maxTokens > 0 &&
      params.topP >= 0 &&
      params.topP <= 1
    );
  }

  static estimateTokenUsage(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  static calculateCost(model: AIModel, tokenCount: number): number {
    const rates: Record<AIModel, number> = {
      [AIModel.GPT4]: 0.03,
      [AIModel.GPT35]: 0.002,
      [AIModel.CLAUDE]: 0.015,
      [AIModel.GEMINI]: 0.001,
    };
    return (tokenCount / 1000) * rates[model];
  }
}

export class SecurityUtils {
  static sanitizeInput(input: string): string {
    // Basic XSS prevention
    return input.replace(/[<>]/g, '');
  }

  static validateApiKey(key: string): boolean {
    return /^[a-zA-Z0-9_-]{32,}$/.test(key);
  }

  static maskSensitiveData(data: string): string {
    return data.replace(/(\w{4})\w+(\w{4})/, '$1****$2');
  }
}

export class PerformanceUtils {
  static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    );
    return Promise.race([promise, timeout]);
  }

  static async retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retry(fn, retries - 1, delay * 2);
    }
  }
} 