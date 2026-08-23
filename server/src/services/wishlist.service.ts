import { WishlistItem } from '../models/WishlistItem';
import { Course } from '../models/Course';
import { AppError } from '../utils/appError';

export class WishlistService {
  static async getWishlist(userId: string) {
    const items = await WishlistItem.find({ user: userId })
      .populate({
        path: 'course',
        populate: [
          { path: 'category', select: 'name slug icon' },
          { path: 'instructor', select: 'name avatar' },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    return items.map((item) => item.course);
  }

  static async addToWishlist(userId: string, courseId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

    const existing = await WishlistItem.findOne({ user: userId, course: courseId });
    if (existing) {
      return existing;
    }

    return WishlistItem.create({ user: userId, course: courseId });
  }

  static async removeFromWishlist(userId: string, courseId: string) {
    await WishlistItem.findOneAndDelete({ user: userId, course: courseId });
    return { success: true };
  }
}
