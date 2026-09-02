import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { ApiResponse } from '../utils/apiResponse';

export class ReviewController {
  static async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { rating, comment } = req.body;
      const review = await ReviewService.addReview(req.user!.userId, req.params.courseId, rating, comment);
      return ApiResponse.success(res, review, 201, 'Review submitted successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async getCourseReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await ReviewService.getCourseReviews(req.params.courseId);
      return ApiResponse.success(res, reviews);
    } catch (error) {
      return next(error);
    }
  }

  static async moderateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { isModerated } = req.body;
      const review = await ReviewService.moderateReview(req.params.id, isModerated, req.user!.userId);
      return ApiResponse.success(res, review, 200, 'Review moderation updated.');
    } catch (error) {
      return next(error);
    }
  }

  static async getAllReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await ReviewService.getAllReviews(page, limit);
      return ApiResponse.paginated(res, result.reviews, {
        ...result.pagination,
        hasNextPage: page < result.pagination.totalPages,
        hasPreviousPage: page > 1,
      });
    } catch (error) {
      return next(error);
    }
  }
}
