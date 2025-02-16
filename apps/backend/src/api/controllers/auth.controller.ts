import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ApiUtils, CryptoUtils } from '@enhanced-ai-agent/shared';
import { LoginCredentials, RegisterData } from '@enhanced-ai-agent/shared';
import { ERROR_MESSAGES } from '@enhanced-ai-agent/shared';
import { JwtService } from '../../services/jwt.service';
import { EmailService } from '../../services/email.service';
import { MonitoringService } from '@enhanced-ai-agent/shared';
import { validateRegistration, validateLogin } from '../validators/auth.validator';
import { AppError } from '../middlewares/error-handler';

const userService = UserService.getInstance();
const jwtService = JwtService.getInstance();
const emailService = EmailService.getInstance();
const monitoring = MonitoringService.getInstance();

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = await validateRegistration(req.body);
      const result = await userService.createUser(validatedData);

      if (result.success) {
        await emailService.sendEmail({
          to: result.data.email,
          template: 'welcome',
          subject: 'Welcome to Enhanced AI Agent',
          data: {
            username: result.data.username,
            verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${result.data.verificationToken}`,
          },
        });

        res.status(201).json(result);
      } else {
        throw new AppError(400, result.error || 'Registration failed');
      }
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = await validateLogin(req.body);
      const result = await userService.login(
        validatedData.email,
        validatedData.password
      );

      if (result.success) {
        res.json(result);
      } else {
        throw new AppError(401, 'Invalid credentials');
      }
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError(400, 'Refresh token is required');
      }

      const userId = await jwtService.verifyRefreshToken(refreshToken);
      if (!userId) {
        throw new AppError(401, 'Invalid refresh token');
      }

      const user = await userService.getUserById(userId);
      if (!user.success || !user.data.isActive) {
        throw new AppError(401, 'User not found or inactive');
      }

      const tokens = await jwtService.generateTokens({
        userId: user.data.id,
        email: user.data.email,
        role: user.data.role,
      });

      res.json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError(400, 'Refresh token is required');
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      await jwtService.invalidateToken(userId, refreshToken);
      res.json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      await jwtService.invalidateAllTokens(userId);
      res.json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await this.authService.initiatePasswordReset(email);

    // Always return success to prevent email enumeration
    return res.json(
      ApiUtils.createSuccessResponse(
        null,
        'If an account exists with this email, you will receive password reset instructions'
      )
    );
  };

  resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const result = await this.authService.resetPassword(token, password);

    if (!result.success) {
      return res.status(400).json(
        ApiUtils.createErrorResponse(result.error!)
      );
    }

    return res.json(
      ApiUtils.createSuccessResponse(null, 'Password reset successful')
    );
  };
} 