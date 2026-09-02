import { Review } from '../models/Review';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { AppError } from '../utils/appError';
import { AuditService } from './audit.service';

export class ReviewService {
  static async addReview(studentId: string, courseId: string, rating: number, comment: string) {
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) {
      throw new AppError('You must be enrolled in the course to leave a review.', 403, 'NOT_ENROLLED');
    }

    const existing = await Review.findOne({ student: studentId, course: courseId });
    if (existing) {
      throw new AppError('You have already submitted a review for this course.', 409, 'REVIEW_EXISTS');
    }

    const review = await Review.create({
      student: studentId,
      course: courseId,
      rating,
      comment,
      isModerated: true,
    });

    await this.recalculateCourseRating(courseId);

    await AuditService.logAction(studentId, 'REVIEW_SUBMITTED', 'Review', (review._id as any).toString(), {
      courseId,
      rating,
    });

    return review;
  }

  static async getCourseReviews(courseId: string) {
    return Review.find({ course: courseId, isModerated: true })
      .populate('student', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  static async moderateReview(reviewId: string, isModerated: boolean, adminId: string) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new AppError('Review not found.', 404, 'REVIEW_NOT_FOUND');
    }

    review.isModerated = isModerated;
    await review.save();

    await this.recalculateCourseRating((review.course as any).toString());

    await AuditService.logAction(adminId, 'REVIEW_MODERATED', 'Review', reviewId, {
      isModerated,
    });

    return review;
  }

  static async getAllReviews(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find()
        .populate('student', 'name email avatar')
        .populate('course', 'title slug thumbnail')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private static async recalculateCourseRating(courseId: string) {
    const stats = await Review.aggregate([
      { $match: { course: (Review as any).base.Types.ObjectId.createFromHexString(courseId), isModerated: true } },
      {
        $group: {
          _id: '$course',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Course.findByIdAndUpdate(courseId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].count,
      });
    } else {
      await Course.findByIdAndUpdate(courseId, {
        rating: 0,
        reviewCount: 0,
      });
    }
  }
}
