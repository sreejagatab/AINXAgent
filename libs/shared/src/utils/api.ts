import { ApiResponse, PromptExecutionResult } from '../types';
import { PerformanceUtils } from './index';
import { ERROR_MESSAGES } from '../constants';

export class ApiUtils {
  static createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static createErrorResponse(error: Error | string): ApiResponse {
    const message = error instanceof Error ? error.message : error;
    return {
      success: false,
      error: message,
    };
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<ApiResponse<T>> {
    try {
      const result = await PerformanceUtils.retry(operation);
      return this.createSuccessResponse(result);
    } catch (error) {
      console.error(`Error in ${context}:`, error);
      return this.createErrorResponse(
        error instanceof Error ? error : ERROR_MESSAGES.SERVER_ERROR
      );
    }
  }

  static validatePromptResult(result: PromptExecutionResult): boolean {
    return (
      result.success &&
      result.output.length > 0 &&
      result.tokenUsage.total > 0 &&
      result.duration > 0
    );
  }

  static formatApiError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return ERROR_MESSAGES.SERVER_ERROR;
  }
} 