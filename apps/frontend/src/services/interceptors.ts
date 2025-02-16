import { AxiosError, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';
import { performanceMonitor } from '../utils/performance';
import { storage } from '../utils/storage';
import { handleError } from '../utils/errorHandler';

export const requestInterceptor = (config: any) => {
  // Add request timing
  const requestId = Math.random().toString(36).substring(7);
  performanceMonitor.mark(`request-start-${requestId}`);
  config.metadata = { ...config.metadata, requestId, startTime: new Date() };

  // Add auth token
  const token = storage.getCookie('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

export const responseInterceptor = (response: AxiosResponse) => {
  const { config } = response;
  const requestId = config.metadata?.requestId;

  if (requestId) {
    performanceMonitor.mark(`request-end-${requestId}`);
    performanceMonitor.measure(
      `request-${config.url}`,
      `request-start-${requestId}`,
      `request-end-${requestId}`
    );
  }

  // Log successful requests in development
  logger.debug('API Response', {
    url: config.url,
    method: config.method,
    status: response.status,
    duration: new Date().getTime() - config.metadata?.startTime?.getTime(),
    data: response.data,
  });

  return response.data;
};

export const errorInterceptor = (error: AxiosError) => {
  const { config, response } = error;

  // Log error details
  logger.error('API Error', {
    url: config?.url,
    method: config?.method,
    status: response?.status,
    data: response?.data,
    error: error.message,
  });

  return Promise.reject(handleError(error));
}; 