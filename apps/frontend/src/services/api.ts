import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { getEnvironment } from '../config/environment';
import { authService } from './auth.service';
import { storage } from '../utils/storage';
import { handleError } from '../utils/errorHandler';

class Api {
  private static instance: Api;
  private axiosInstance: AxiosInstance;
  private refreshTokenPromise: Promise<any> | null = null;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: getEnvironment().API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response.data,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (!this.refreshTokenPromise) {
            this.refreshTokenPromise = authService.refreshToken()
              .then((response) => {
                this.refreshTokenPromise = null;
                return response;
              })
              .catch((error) => {
                this.refreshTokenPromise = null;
                storage.clearAll();
                window.location.href = '/login';
                return Promise.reject(error);
              });
          }

          try {
            await this.refreshTokenPromise;
            originalRequest._retry = true;
            return this.axiosInstance(originalRequest);
          } catch (error) {
            return Promise.reject(error);
          }
        }

        return Promise.reject(handleError(error));
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.get(url, config);
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.post(url, data, config);
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.put(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.delete(url, config);
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.patch(url, data, config);
  }
}

export const api = Api.getInstance(); 