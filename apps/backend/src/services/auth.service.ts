import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import type { LoginDto, RegisterDto, TokenPayload } from '../types/auth.types';
import type { User } from '@prisma/client';

export class AuthService {
  private static instance: AuthService;
  private readonly SALT_ROUNDS = 10;
  private readonly TOKEN_PREFIX = 'token:';
  private readonly BLACKLIST_PREFIX = 'blacklist:';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async register(data: RegisterDto): Promise<{ user: User; token: string }> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw ApiError.conflict('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
        },
      });

      const token = this.generateToken(user);
      await this.storeToken(user.id, token);

      // Send welcome email
      await this.queueWelcomeEmail(user);

      return { user, token };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  public async login(data: LoginDto): Promise<{ user: User; token: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        throw ApiError.unauthorized('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        throw ApiError.unauthorized('Invalid credentials');
      }

      const token = this.generateToken(user);
      await this.storeToken(user.id, token);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      return { user, token };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  public async logout(token: string): Promise<void> {
    try {
      await redis.setex(
        `${this.BLACKLIST_PREFIX}${token}`,
        24 * 3600, // 24 hours
        'true'
      );
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  public async verifyToken(token: string): Promise<User | null> {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await redis.get(`${this.BLACKLIST_PREFIX}${token}`);
      if (isBlacklisted) {
        return null;
      }

      const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      return user;
    } catch (error) {
      logger.error('Token verification failed:', error);
      return null;
    }
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
  }

  private async storeToken(userId: string, token: string): Promise<void> {
    await redis.setex(
      `${this.TOKEN_PREFIX}${userId}:${token}`,
      24 * 3600, // 24 hours
      'true'
    );
  }

  private async queueWelcomeEmail(user: User): Promise<void> {
    await queueService.addJob('email', {
      to: user.email,
      template: 'welcome',
      subject: 'Welcome to our platform!',
      data: {
        name: user.name,
        email: user.email,
      },
    });
  }

  public async resetPassword(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Return success even if user doesn't exist for security
        return;
      }

      const token = jwt.sign(
        { userId: user.id, type: 'password-reset' },
        config.JWT_SECRET,
        { expiresIn: '1h' }
      );

      await queueService.addJob('email', {
        to: user.email,
        template: 'password-reset',
        subject: 'Password Reset Request',
        data: {
          resetLink: `${config.APP_URL}/reset-password?token=${token}`,
          name: user.name,
        },
      });
    } catch (error) {
      logger.error('Password reset request failed:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance(); 