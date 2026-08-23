import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { Review } from '../models/Review';
import { Types } from 'mongoose';

export class InstructorService {
  static async getInstructorAnalytics(instructorId: string) {
    const instructorObjectId = new Types.ObjectId(instructorId);

    // Get instructor courses
    const courses = await Course.find({ instructor: instructorId }).lean();
    const courseIds = courses.map((c) => c._id);

    const [totalEnrollments, completedEnrollments] = await Promise.all([
      Enrollment.countDocuments({ course: { $in: courseIds } }),
      Enrollment.countDocuments({ course: { $in: courseIds }, status: 'COMPLETED' }),
    ]);

    // Calculate revenue stats for instructor courses
    const revenueStats = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseDetails',
        },
      },
      { $unwind: '$courseDetails' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$courseDetails.price' },
        },
      },
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    // Instructor average rating across courses
    const ratingStats = await Course.aggregate([
      { $match: { instructor: instructorObjectId, status: 'PUBLISHED' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: '$reviewCount' },
        },
      },
    ]);

    const averageRating = ratingStats.length > 0 ? Math.round(ratingStats[0].avgRating * 10) / 10 : 0;
    const totalReviews = ratingStats.length > 0 ? ratingStats[0].totalReviews : 0;

    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    return {
      metrics: {
        totalCourses: courses.length,
        totalStudents: totalEnrollments,
        completionRate,
        averageRating,
        totalReviews,
        totalRevenue,
      },
      courses: courses.map((c) => ({
        id: (c._id as any).toString(),
        title: c.title,
        slug: c.slug,
        thumbnail: c.thumbnail,
        type: c.type,
        status: c.status,
        price: c.price,
        students: c.enrollmentCount,
        rating: c.rating,
        reviewCount: c.reviewCount,
        publishedAt: c.publishedAt,
      })),
    };
  }
}
