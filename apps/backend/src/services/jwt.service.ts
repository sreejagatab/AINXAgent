import jwt from 'jsonwebtoken';
import { RedisService } from './redis.service';
import { PerformanceMonitor } from '@enhanced-ai-agent/shared';
import { CACHE_KEYS } from '@enhanced-ai-agent/shared';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class JwtService {
  private static instance: JwtService;
  private redis: RedisService;
  private monitor: PerformanceMonitor;
  private readonly secret: string;
  private readonly tokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.redis = RedisService.getInstance();
    this.monitor = PerformanceMonitor.getInstance('JwtService');
    this.secret = process.env.JWT_SECRET!;
    this.tokenExpiry = process.env.JWT_EXPIRY || '1h';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  static getInstance(): JwtService {
    if (!JwtService.instance) {
      JwtService.instance = new JwtService();
    }
    return JwtService.instance;
  }

  async generateTokens(payload: TokenPayload): Promise<{ token: string; refreshToken: string }> {
    const startTime = Date.now();
    try {
      const token = jwt.sign(payload, this.secret, { expiresIn: this.tokenExpiry });
      const refreshToken = jwt.sign({ userId: payload.userId }, this.secret, {
        expiresIn: this.refreshTokenExpiry,
      });

      // Store refresh token in Redis
      await this.redis.set(
        `${CACHE_KEYS.SESSION_DATA}${payload.userId}:${refreshToken}`,
        'valid',
        parseInt(this.refreshTokenExpiry) * 1000
      );

      this.monitor.recordMetric('token_generation', Date.now() - startTime);
      return { token, refreshToken };
    } catch (error) {
      this.monitor.recordError('token_generation_failed', error as Error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    const startTime = Date.now();
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      this.monitor.recordMetric('token_verification', Date.now() - startTime);
      return decoded;
    } catch (error) {
      this.monitor.recordError('token_verification_failed', error as Error);
      return null;
    }
  }

  async verifyRefreshToken(refreshToken: string): Promise<string | null> {
    const startTime = Date.now();
    try {
      const decoded = jwt.verify(refreshToken, this.secret) as { userId: string };
      
      // Check if refresh token is valid in Redis
      const isValid = await this.redis.get(
        `${CACHE_KEYS.SESSION_DATA}${decoded.userId}:${refreshToken}`
      );

      if (!isValid) {
        return null;
      }

      this.monitor.recordMetric('refresh_token_verification', Date.now() - startTime);
      return decoded.userId;
    } catch (error) {
      this.monitor.recordError('refresh_token_verification_failed', error as Error);
      return null;
    }
  }

  async invalidateToken(userId: string, refreshToken: string): Promise<void> {
    const startTime = Date.now();
    try {
      await this.redis.del(`${CACHE_KEYS.SESSION_DATA}${userId}:${refreshToken}`);
      this.monitor.recordMetric('token_invalidation', Date.now() - startTime);
    } catch (error) {
      this.monitor.recordError('token_invalidation_failed', error as Error);
      throw error;
    }
  }

  async invalidateAllTokens(userId: string): Promise<void> {
    const startTime = Date.now();
    try {
      const pattern = `${CACHE_KEYS.SESSION_DATA}${userId}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      
      this.monitor.recordMetric('all_tokens_invalidation', Date.now() - startTime);
    } catch (error) {
      this.monitor.recordError('all_tokens_invalidation_failed', error as Error);
      throw error;
    }
  }
} 