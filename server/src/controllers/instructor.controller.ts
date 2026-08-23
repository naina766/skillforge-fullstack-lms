import { Request, Response, NextFunction } from 'express';
import { InstructorService } from '../services/instructor.service';
import { ApiResponse } from '../utils/apiResponse';

export class InstructorController {
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await InstructorService.getInstructorAnalytics(req.user!.userId);
      return ApiResponse.success(res, data);
    } catch (error) {
      return next(error);
    }
  }
}
