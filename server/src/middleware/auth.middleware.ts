import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiResponse } from '../utils/apiResponse';
import { User } from '../models/User';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Authentication required. No token provided.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.userId).select('isActive role email name');
    if (!user || !user.isActive) {
      return ApiResponse.error(res, 'User account does not exist or has been deactivated.', 401, 'UNAUTHORIZED');
    }

    req.user = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired access token.', 401, 'UNAUTHORIZED');
  }
};
