import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { env } from '../config/env';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.register(req.body);
      return ApiResponse.success(res, user, 201, 'Registration successful. You can now log in.');
    } catch (error) {
      return next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;
      const { email, password } = req.body;

      const result = await AuthService.login(email, password, userAgent, ipAddress);

      // Set HTTP-only Cookie for Refresh Token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return ApiResponse.success(res, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token required.', 401, 'TOKEN_REQUIRED');
      }

      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await AuthService.refreshToken(refreshToken, userAgent, ipAddress);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ApiResponse.success(res, {
        accessToken: result.accessToken,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const userId = req.user!.userId;

      await AuthService.logout(userId, refreshToken);

      res.clearCookie('refreshToken');
      return ApiResponse.success(res, { message: 'Logged out successfully.' });
    } catch (error) {
      return next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const me = await AuthService.getMe(req.user!.userId);
      return ApiResponse.success(res, me);
    } catch (error) {
      return next(error);
    }
  }
}
