import { User, UserRole } from '../models/User';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { Review } from '../models/Review';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../utils/appError';
import { AuditService } from './audit.service';

export class AdminService {
  static async getPlatformAnalytics() {
    const [
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      reviewsCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'INSTRUCTOR' }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'COMPLETED' }),
      Review.countDocuments(),
    ]);

    // Aggregate platform revenue (Sum of enrolled course prices)
    const revenueStats = await Enrollment.aggregate([
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

    // Student growth over time (Grouped by month for last 6 months)
    const studentGrowth = await User.aggregate([
      { $match: { role: 'STUDENT' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    // Enrollment growth over time
    const enrollmentGrowth = await Enrollment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    // Category Distribution
    const categoryDistribution = await Course.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetail',
        },
      },
      { $unwind: '$categoryDetail' },
      {
        $group: {
          _id: '$categoryDetail.name',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      metrics: {
        totalStudents,
        totalInstructors,
        totalCourses,
        totalEnrollments,
        completedEnrollments,
        totalRevenue,
        reviewsCount,
      },
      charts: {
        studentGrowth: studentGrowth.map((g) => ({ month: g._id, count: g.count })),
        enrollmentGrowth: enrollmentGrowth.map((g) => ({ month: g._id, count: g.count })),
        categoryDistribution: categoryDistribution.map((c) => ({ name: c._id, value: c.count })),
      },
    };
  }

  static async getUsers(role?: string, search?: string, page = 1, limit = 20) {
    const query: any = {};
    if (role) {
      query.role = role;
    }
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async updateUserRoleOrStatus(userId: string, role?: UserRole, isActive?: boolean, adminId?: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    if (adminId) {
      await AuditService.logAction(adminId, 'USER_UPDATED_BY_ADMIN', 'User', userId, {
        role: user.role,
        isActive: user.isActive,
      });
    }

    return user;
  }

  static async getAuditLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
