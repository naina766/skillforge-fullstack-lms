import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiResponse } from '../utils/apiResponse';

export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await NotificationService.getUserNotifications(req.user!.userId);
      return ApiResponse.success(res, data);
    } catch (error) {
      return next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user!.userId);
      return ApiResponse.success(res, notification);
    } catch (error) {
      return next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user!.userId);
      return ApiResponse.success(res, { message: 'All notifications marked as read.' });
    } catch (error) {
      return next(error);
    }
  }
}
