import { authController } from '../auth.controller';
import { authService } from '../../services/auth.service';
import { mockRequest, mockResponse, mockNext } from '../../test/setup';
import { ApiError } from '../../utils/errors';

// Mock auth service
jest.mock('../../services/auth.service');

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token on successful login', async () => {
      const mockToken = 'mock-token';
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'USER',
      };

      (authService.login as jest.Mock).mockResolvedValue({
        token: mockToken,
        user: mockUser,
      });

      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });
      const res = mockResponse();
      const next = mockNext();

      await authController.login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith(
        req.body.email,
        req.body.password
      );
      expect(res.json).toHaveBeenCalledWith({
        token: mockToken,
        user: mockUser,
      });
    });

    it('should handle invalid credentials', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new ApiError(401, 'Invalid credentials')
      );

      const req = mockRequest({
        body: {
          email: 'wrong@example.com',
          password: 'wrongpass',
        },
      });
      const res = mockResponse();
      const next = mockNext();

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.any(ApiError)
      );
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should create new user and return token', async () => {
      const mockToken = 'mock-token';
      const mockUser = {
        id: '1',
        email: 'new@example.com',
        role: 'USER',
      };

      (authService.register as jest.Mock).mockResolvedValue({
        token: mockToken,
        user: mockUser,
      });

      const req = mockRequest({
        body: {
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        },
      });
      const res = mockResponse();
      const next = mockNext();

      await authController.register(req, res, next);

      expect(authService.register).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        token: mockToken,
        user: mockUser,
      });
    });
  });
}); 