import { getEnvironment } from '../config/environment';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';
import { analyticsService } from './analytics.service';
import { apiRateLimiter } from '../utils/rateLimiter';
import { apiRetry } from '../utils/apiRetry';

interface RequestConfig extends RequestInit {
  retry?: boolean;
  rateLimit?: boolean;
  cache?: boolean;
  timeout?: number;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  requestId?: string;
}

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;
  private defaultConfig: RequestConfig;

  private constructor() {
    const env = getEnvironment();
    this.baseUrl = env.API_URL;
    this.defaultConfig = {
      retry: true,
      rateLimit: true,
      cache: false,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private getAuthHeader(): Record<string, string> {
    const token = storage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const requestId = response.headers.get('X-Request-ID');
    const contentType = response.headers.get('Content-Type');

    if (!response.ok) {
      const error = await this.parseErrorResponse(response);
      throw error;
    }

    let data: T;
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as unknown as T;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
      requestId,
    };
  }

  private async parseErrorResponse(response: Response): Promise<Error> {
    try {
      const data = await response.json();
      return new Error(data.message || 'API request failed');
    } catch {
      return new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private async executeRequest<T>(
    url: string,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    const finalConfig = {
      ...this.defaultConfig,
      ...config,
      headers: {
        ...this.defaultConfig.headers,
        ...this.getAuthHeader(),
        ...config.headers,
      },
    };

    if (finalConfig.rateLimit) {
      await apiRateLimiter.waitForReset(url);
    }

    const executeWithTimeout = async (): Promise<Response> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), finalConfig.timeout);

      try {
        const response = await fetch(fullUrl, {
          ...finalConfig,
          signal: controller.signal,
        });
        return response;
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      const response = await (finalConfig.retry
        ? apiRetry.execute(() => executeWithTimeout(), url)
        : executeWithTimeout());

      analyticsService.trackEvent('api_request_success', {
        url,
        method: finalConfig.method || 'GET',
        status: response.status,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      logger.error('API request failed', {
        url,
        method: finalConfig.method || 'GET',
        error,
      });

      analyticsService.trackEvent('api_request_error', {
        url,
        method: finalConfig.method || 'GET',
        error: error.message,
      });

      throw error;
    }
  }

  public async get<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, { ...config, method: 'GET' });
  }

  public async post<T>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async put<T>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async delete<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, { ...config, method: 'DELETE' });
  }

  public async patch<T>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = ApiService.getInstance(); 