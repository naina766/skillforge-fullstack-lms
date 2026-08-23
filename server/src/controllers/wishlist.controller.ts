import { Request, Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlist.service';
import { ApiResponse } from '../utils/apiResponse';

export class WishlistController {
  static async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const courses = await WishlistService.getWishlist(req.user!.userId);
      return ApiResponse.success(res, courses);
    } catch (error) {
      return next(error);
    }
  }

  static async addToWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await WishlistService.addToWishlist(req.user!.userId, req.params.courseId);
      return ApiResponse.success(res, item, 201, 'Course added to wishlist.');
    } catch (error) {
      return next(error);
    }
  }

  static async removeFromWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      await WishlistService.removeFromWishlist(req.user!.userId, req.params.courseId);
      return ApiResponse.success(res, { message: 'Course removed from wishlist.' });
    } catch (error) {
      return next(error);
    }
  }
}
