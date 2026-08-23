import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { ApiResponse } from '../utils/apiResponse';

export class AdminController {
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getPlatformAnalytics();
      return ApiResponse.success(res, data);
    } catch (error) {
      return next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const role = req.query.role as string;
      const search = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await AdminService.getUsers(role, search, page, limit);
      return ApiResponse.paginated(res, result.users, {
        ...result.pagination,
        hasNextPage: page < result.pagination.totalPages,
        hasPreviousPage: page > 1,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateUserRoleOrStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, isActive } = req.body;
      const user = await AdminService.updateUserRoleOrStatus(req.params.id, role, isActive, req.user!.userId);
      return ApiResponse.success(res, user, 200, 'User profile updated.');
    } catch (error) {
      return next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await AdminService.getAuditLogs(page, limit);
      return ApiResponse.paginated(res, result.logs, {
        ...result.pagination,
        hasNextPage: page < result.pagination.totalPages,
        hasPreviousPage: page > 1,
      });
    } catch (error) {
      return next(error);
    }
  }
}
