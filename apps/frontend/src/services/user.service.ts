import { api } from './api';
import { ApiResponse, User, UserPreferences } from '@enhanced-ai-agent/shared';
import { handleError } from '../utils/errorHandler';
import { analytics } from '../utils/analytics';

export class UserService {
  private static instance: UserService;
  private baseUrl = '/api/users';

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async getCurrentUser(): Promise<ApiResponse<{ user: User; preferences: UserPreferences }>> {
    try {
      const response = await api.get<ApiResponse<{ user: User; preferences: UserPreferences }>>(
        `${this.baseUrl}/me`
      );

      if (response.success) {
        analytics.setUser(response.data.user.id);
      }

      return response;
    } catch (error) {
      throw handleError(error);
    }
  }

  public async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await api.put<ApiResponse<User>>(`${this.baseUrl}/profile`, data);
    } catch (error) {
      throw handleError(error);
    }
  }

  public async updatePreferences(data: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    try {
      return await api.put<ApiResponse<UserPreferences>>(`${this.baseUrl}/preferences`, data);
    } catch (error) {
      throw handleError(error);
    }
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      return await api.put<ApiResponse<void>>(`${this.baseUrl}/password`, {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw handleError(error);
    }
  }

  public async deleteAccount(password: string): Promise<ApiResponse<void>> {
    try {
      return await api.delete<ApiResponse<void>>(`${this.baseUrl}/account`, {
        data: { password },
      });
    } catch (error) {
      throw handleError(error);
    }
  }
}

export const userService = UserService.getInstance(); 