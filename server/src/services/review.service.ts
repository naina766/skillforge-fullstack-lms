import { Types } from 'mongoose';
import { Review } from '../models/Review';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { AppError } from '../utils/appError';
import { AuditService } from './audit.service';
import { emitRatingUpdated } from '../config/socket';

export class ReviewService {
  /**
   * Submit a new course review
   */
  static async addReview(studentId: string, courseId: string, rating: number, comment = '') {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

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
      comment: comment.trim(),
      isModerated: true,
    });

    const aggregates = await this.recalculateCourseRating(courseId);

    await AuditService.logAction(studentId, 'REVIEW_SUBMITTED', 'Review', (review._id as any).toString(), {
      courseId,
      rating,
    });

    const populatedReview = await Review.findById(review._id).populate('student', 'name avatar').lean();

    return {
      review: populatedReview,
      courseRating: aggregates,
    };
  }

  /**
   * Get the logged-in student's review for a course
   */
  static async getMyReview(studentId: string, courseId: string) {
    const review = await Review.findOne({ student: studentId, course: courseId })
      .populate('student', 'name avatar')
      .lean();

    return review;
  }

  /**
   * Update an existing review by the student owner
   */
  static async updateReview(reviewId: string, studentId: string, rating?: number, comment?: string) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new AppError('Review not found.', 404, 'REVIEW_NOT_FOUND');
    }

    if (review.student.toString() !== studentId) {
      throw new AppError('You do not have permission to update this review.', 403, 'FORBIDDEN');
    }

    if (rating !== undefined) {
      review.rating = rating;
    }
    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();

    const courseId = review.course.toString();
    const aggregates = await this.recalculateCourseRating(courseId);

    await AuditService.logAction(studentId, 'REVIEW_UPDATED', 'Review', reviewId, {
      courseId,
      rating: review.rating,
    });

    const populatedReview = await Review.findById(review._id).populate('student', 'name avatar').lean();

    return {
      review: populatedReview,
      courseRating: aggregates,
    };
  }

  /**
   * Delete an existing review by owner or admin
   */
  static async deleteReview(reviewId: string, userId: string, isAdmin: boolean) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new AppError('Review not found.', 404, 'REVIEW_NOT_FOUND');
    }

    if (!isAdmin && review.student.toString() !== userId) {
      throw new AppError('You do not have permission to delete this review.', 403, 'FORBIDDEN');
    }

    const courseId = review.course.toString();
    await Review.findByIdAndDelete(reviewId);

    const aggregates = await this.recalculateCourseRating(courseId);

    await AuditService.logAction(userId, 'REVIEW_DELETED', 'Review', reviewId, {
      courseId,
    });

    return {
      success: true,
      courseRating: aggregates,
    };
  }

  /**
   * Get paginated reviews for a course
   */
  static async getCourseReviews(courseId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const courseObjectId = new Types.ObjectId(courseId);

    const [reviews, total, course] = await Promise.all([
      Review.find({ course: courseObjectId, isModerated: true })
        .populate('student', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ course: courseObjectId, isModerated: true }),
      Course.findById(courseId).select('rating reviewCount ratingDistribution').lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary: {
        ratingAverage: course?.rating || 0,
        ratingCount: course?.reviewCount || 0,
        ratingDistribution: course?.ratingDistribution || {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      },
    };
  }

  /**
   * Admin moderate review
   */
  static async moderateReview(reviewId: string, isModerated: boolean, adminId: string) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new AppError('Review not found.', 404, 'REVIEW_NOT_FOUND');
    }

    review.isModerated = isModerated;
    await review.save();

    const courseId = review.course.toString();
    const aggregates = await this.recalculateCourseRating(courseId);

    await AuditService.logAction(adminId, 'REVIEW_MODERATED', 'Review', reviewId, {
      isModerated,
    });

    return {
      review,
      courseRating: aggregates,
    };
  }

  /**
   * Admin get all platform reviews
   */
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

  /**
   * Recalculates course average rating, total count, and 1-5 star distribution
   */
  static async recalculateCourseRating(courseId: string) {
    const courseObjectId = new Types.ObjectId(courseId);

    const [overallStats, distributionStats] = await Promise.all([
      Review.aggregate([
        { $match: { course: courseObjectId, isModerated: true } },
        {
          $group: {
            _id: '$course',
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]),
      Review.aggregate([
        { $match: { course: courseObjectId, isModerated: true } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const ratingDistribution: { [key: string]: number } = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    distributionStats.forEach((d: { _id: number; count: number }) => {
      if (d._id >= 1 && d._id <= 5) {
        ratingDistribution[d._id.toString()] = d.count;
      }
    });

    let ratingAverage = 0;
    let ratingCount = 0;

    if (overallStats.length > 0) {
      ratingAverage = Math.round(overallStats[0].avgRating * 10) / 10;
      ratingCount = overallStats[0].count;
    }

    await Course.findByIdAndUpdate(courseId, {
      rating: ratingAverage,
      reviewCount: ratingCount,
      ratingDistribution,
    });

    emitRatingUpdated({
      courseId,
      ratingAverage,
      ratingCount,
      ratingDistribution,
    });

    return {
      ratingAverage,
      ratingCount,
      ratingDistribution,
    };
  }
}
