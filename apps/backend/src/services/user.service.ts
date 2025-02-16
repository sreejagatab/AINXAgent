import { PrismaClient } from '@prisma/client';
import { ApiUtils, CryptoUtils } from '@enhanced-ai-agent/shared';
import { RedisService } from './redis.service';
import { JwtService } from './jwt.service';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';
import { CACHE_KEYS } from '@enhanced-ai-agent/shared';
import { AppError } from '../api/middlewares/error-handler';

export class UserService {
  private static instance: UserService;
  private prisma: PrismaClient;
  private redis: RedisService;
  private jwtService: JwtService;
  private monitor: PerformanceMonitor;

  constructor() {
    this.prisma = new PrismaClient();
    this.redis = RedisService.getInstance();
    this.jwtService = JwtService.getInstance();
    this.monitor = PerformanceMonitor.getInstance('UserService');
  }

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async createUser(data: {
    email: string;
    username: string;
    password: string;
  }) {
    const startTime = Date.now();
    try {
      const hashedPassword = await CryptoUtils.hashPassword(data.password);
      
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
          preferences: {
            create: {
              theme: 'light',
              notifications: {
                email: true,
                push: false,
                desktop: true,
                frequency: 'daily',
              },
              language: 'en',
              aiModel: 'gpt-3.5-turbo',
            },
          },
        },
        include: {
          preferences: true,
        },
      });

      const { password, ...userWithoutPassword } = user;
      this.monitor.recordMetric('user_creation', Date.now() - startTime);
      
      return ApiUtils.createSuccessResponse(userWithoutPassword);
    } catch (error) {
      this.monitor.recordError('user_creation_failed', error as Error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    const startTime = Date.now();
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive) {
        throw new AppError(401, 'Invalid credentials');
      }

      const isPasswordValid = await CryptoUtils.verifyPassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        throw new AppError(401, 'Invalid credentials');
      }

      const tokens = await this.jwtService.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      const { password: _, ...userWithoutPassword } = user;
      this.monitor.recordMetric('user_login', Date.now() - startTime);

      return ApiUtils.createSuccessResponse({
        user: userWithoutPassword,
        ...tokens,
      });
    } catch (error) {
      this.monitor.recordError('user_login_failed', error as Error);
      throw error;
    }
  }

  async getUserById(id: string) {
    const startTime = Date.now();
    try {
      // Try to get from cache first
      const cached = await this.redis.get(`${CACHE_KEYS.USER_DATA}${id}`);
      if (cached) {
        this.monitor.recordMetric('user_cache_hit', Date.now() - startTime);
        return ApiUtils.createSuccessResponse(JSON.parse(cached));
      }

      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          preferences: true,
        },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      const { password, ...userWithoutPassword } = user;
      
      // Cache the user data
      await this.redis.set(
        `${CACHE_KEYS.USER_DATA}${id}`,
        JSON.stringify(userWithoutPassword),
        3600 // 1 hour
      );

      this.monitor.recordMetric('user_retrieval', Date.now() - startTime);
      return ApiUtils.createSuccessResponse(userWithoutPassword);
    } catch (error) {
      this.monitor.recordError('user_retrieval_failed', error as Error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    const cachedUser = await this.redis.get(`${CACHE_KEYS.USER_PROFILE}${userId}`);
    if (cachedUser) {
      return ApiUtils.createSuccessResponse(JSON.parse(cachedUser));
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      return ApiUtils.createErrorResponse('User not found');
    }

    const sanitizedUser = this.sanitizeUser(user);
    await this.redis.set(
      `${CACHE_KEYS.USER_PROFILE}${userId}`,
      JSON.stringify(sanitizedUser),
      3600 // 1 hour
    );

    return ApiUtils.createSuccessResponse(sanitizedUser);
  }

  async updateProfile(
    userId: string,
    data: Partial<User>
  ): Promise<ApiResponse<User>> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        email: data.email,
        // Don't allow role updates through this method
        preferences: data.preferences
          ? { update: data.preferences }
          : undefined,
      },
      include: {
        preferences: true,
      },
    });

    await this.redis.del(`${CACHE_KEYS.USER_PROFILE}${userId}`);
    return ApiUtils.createSuccessResponse(this.sanitizeUser(user));
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<null>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return ApiUtils.createErrorResponse('User not found');
    }

    const isValidPassword = await CryptoUtils.verifyPassword(
      currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return ApiUtils.createErrorResponse('Current password is incorrect');
    }

    const hashedPassword = await CryptoUtils.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return ApiUtils.createSuccessResponse(null, 'Password updated successfully');
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<ApiResponse<UserPreferences>> {
    const updatedPreferences = await this.prisma.userPreferences.update({
      where: { userId },
      data: preferences,
    });

    await this.redis.del(`${CACHE_KEYS.USER_PROFILE}${userId}`);
    return ApiUtils.createSuccessResponse(updatedPreferences);
  }

  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
} 