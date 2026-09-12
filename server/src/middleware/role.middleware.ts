import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required before checking authorization.', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        {
          method: req.method,
          path: req.originalUrl || req.url,
          userId: req.user.userId,
          userRole: req.user.role,
          allowedRoles,
        },
        '[RBAC 403 Forbidden]'
      );

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
