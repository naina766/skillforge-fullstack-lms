import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from '../services/enrollment.service';
import { ApiResponse } from '../utils/apiResponse';

export class EnrollmentController {
  static async enroll(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.body;
      const enrollment = await EnrollmentService.enroll(req.user!.userId, courseId);
      return ApiResponse.success(res, enrollment, 201, 'Successfully enrolled in course.');
    } catch (error) {
      return next(error);
    }
  }

  static async getUserEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollments = await EnrollmentService.getUserEnrollments(req.user!.userId);
      return ApiResponse.success(res, enrollments);
    } catch (error) {
      return next(error);
    }
  }

  static async getEnrollmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollment = await EnrollmentService.getEnrollmentById(req.params.id, req.user!.userId);
      return ApiResponse.success(res, enrollment);
    } catch (error) {
      return next(error);
    }
  }

  static async getEnrollmentByCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollment = await EnrollmentService.getEnrollmentByCourse(req.user!.userId, req.params.courseId);
      return ApiResponse.success(res, enrollment);
    } catch (error) {
      return next(error);
    }
  }

  static async updateVideoProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId, watchedSeconds, duration } = req.body;
      const result = await EnrollmentService.updateVideoProgress(
        req.params.id,
        req.user!.userId,
        lessonId,
        parseFloat(watchedSeconds) || 0,
        parseFloat(duration) || 0
      );
      return ApiResponse.success(res, result, 200, 'Video playback progress recorded.');
    } catch (error) {
      return next(error);
    }
  }

  static async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId, isCompleted } = req.body;
      const result = await EnrollmentService.updateProgress(
        req.params.id,
        req.user!.userId,
        lessonId,
        isCompleted
      );
      return ApiResponse.success(res, result, 200, 'Learning progress updated.');
    } catch (error) {
      return next(error);
    }
  }
}
