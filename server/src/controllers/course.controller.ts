import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';
import { ApiResponse } from '../utils/apiResponse';

export class CourseController {
  static async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 12,
        search: req.query.search as string,
        category: req.query.category as string,
        level: req.query.level as string,
        type: req.query.type as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        sort: req.query.sort as string,
        status: req.query.status as any,
      };

      const result = await CourseService.getCourses(filters);
      return ApiResponse.paginated(res, result.items, result.pagination);
    } catch (error) {
      return next(error);
    }
  }

  static async getCourseBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await CourseService.getCourseBySlug(req.params.slug);
      return ApiResponse.success(res, course);
    } catch (error) {
      return next(error);
    }
  }

  static async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await CourseService.getCourseById(req.params.id);
      return ApiResponse.success(res, course);
    } catch (error) {
      return next(error);
    }
  }

  static async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await CourseService.createCourse(req.user!.userId, req.body);
      return ApiResponse.success(res, course, 201, 'Course draft created successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const isUserAdmin = req.user!.role === 'ADMIN';
      const course = await CourseService.updateCourse(req.params.id, req.user!.userId, isUserAdmin, req.body);
      return ApiResponse.success(res, course, 200, 'Course updated successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const isUserAdmin = req.user!.role === 'ADMIN';
      await CourseService.deleteCourse(req.params.id, req.user!.userId, isUserAdmin);
      return ApiResponse.success(res, { message: 'Course deleted successfully.' });
    } catch (error) {
      return next(error);
    }
  }

  static async updateCourseStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const isUserAdmin = req.user!.role === 'ADMIN';
      const course = await CourseService.updateCourseStatus(req.params.id, status, req.user!.userId, isUserAdmin);
      return ApiResponse.success(res, course, 200, `Course status updated to ${status}.`);
    } catch (error) {
      return next(error);
    }
  }
}
