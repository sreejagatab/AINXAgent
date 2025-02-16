import { api } from './api';
import { storage } from '../utils/storage';
import { getEnvironment } from '../config/environment';
import { ApiResponse, LoginResponse, User } from '@enhanced-ai-agent/shared';

export class AuthService {
  private static instance: AuthService;
  private tokenKey: string;

  private constructor() {
    this.tokenKey = getEnvironment().AUTH_COOKIE_NAME;
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  public async register(data: {
    email: string;
    password: string;
    username: string;
  }): Promise<ApiResponse<User>> {
    return api.post<ApiResponse<User>>('/auth/register', data);
  }

  public async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>('/auth/forgot-password', { email });
  }

  public async resetPassword(
    token: string,
    password: string
  ): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      password,
    });
  }

  public async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>('/auth/verify-email', { token });
  }

  public async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await api.post<ApiResponse<{ token: string }>>(
      '/auth/refresh-token'
    );

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  public async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  public getToken(): string | undefined {
    return storage.getCookie(this.tokenKey);
  }

  private setToken(token: string): void {
    storage.setCookie(this.tokenKey, token, {
      expires: 7, // 7 days
      path: '/',
    });
  }

  private clearToken(): void {
    storage.removeCookie(this.tokenKey);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = AuthService.getInstance(); 