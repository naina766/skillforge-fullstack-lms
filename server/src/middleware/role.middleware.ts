import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { ApiResponse } from '../utils/apiResponse';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required before checking authorization.', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Forbidden. Access restricted to roles: ${allowedRoles.join(', ')}`,
        403,
        'FORBIDDEN'
      );
    }

    return next();
  };
};
