import { Course, ICourse, CourseStatus, CourseType } from '../models/Course';
import { Category } from '../models/Category';
import { AppError } from '../utils/appError';
import { createSlug } from '../utils/slugify';
import { AuditService } from './audit.service';

export interface CourseQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  status?: CourseStatus;
}

export class CourseService {
  static async getCourses(filters: CourseQueryFilters) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 50) : 12;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Default to only PUBLISHED courses unless status is explicitly overridden
    if (filters.status) {
      query.status = filters.status;
    } else {
      query.status = 'PUBLISHED';
    }

    if (filters.category) {
      // Find category by slug or id
      const cat = await Category.findOne({
        $or: [{ _id: filters.category.match(/^[0-9a-fA-F]{24}$/) ? filters.category : null }, { slug: filters.category }],
      });
      if (cat) {
        query.category = cat._id;
      }
    }

    if (filters.level) {
      query.level = filters.level;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (filters.search && filters.search.trim()) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { shortDescription: searchRegex }, { skills: searchRegex }];
    }

    let sortOptions: any = { createdAt: -1 };
    switch (filters.sort) {
      case 'popular':
        sortOptions = { enrollmentCount: -1, rating: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, reviewCount: -1 };
        break;
      case 'newest':
        sortOptions = { publishedAt: -1, createdAt: -1 };
        break;
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const [items, total] = await Promise.all([
      Course.find(query)
        .populate('category', 'name slug icon')
        .populate('instructor', 'name avatar bio')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  static async getCourseBySlug(slug: string) {
    const course = await Course.findOne({ slug })
      .populate('category', 'name slug icon description')
      .populate('instructor', 'name avatar bio skills')
      .lean();

    if (!course) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

    return course;
  }

  static async getCourseById(id: string) {
    const course = await Course.findById(id)
      .populate('category', 'name slug icon')
      .populate('instructor', 'name avatar bio')
      .lean();

    if (!course) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

    return course;
  }

  static async createCourse(instructorId: string, data: Partial<ICourse>) {
    let slug = createSlug(data.title || 'untitled-course');
    const existingSlug = await Course.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const course = await Course.create({
      ...data,
      slug,
      instructor: instructorId,
      status: 'DRAFT',
    });

    await AuditService.logAction(instructorId, 'COURSE_CREATED', 'Course', (course._id as any).toString(), {
      title: course.title,
    });

    return course;
  }

  static async updateCourse(courseId: string, userId: string, isUserAdmin: boolean, data: Partial<ICourse>) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

    if (!isUserAdmin && course.instructor.toString() !== userId) {
      throw new AppError('You do not have permission to update this course.', 403, 'FORBIDDEN');
    }

    if (data.title && data.title !== course.title) {
      let slug = createSlug(data.title);
      const existingSlug = await Course.findOne({ slug, _id: { $ne: courseId } });
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
      data.slug = slug;
    }

    Object.assign(course, data);
    await course.save();

    await AuditService.logAction(userId, 'COURSE_UPDATED', 'Course', courseId, {
      title: course.title,
    });

    return course;
  }

  static async deleteCourse(courseId: string, userId: string, isUserAdmin: boolean) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

    if (!isUserAdmin && course.instructor.toString() !== userId) {
      throw new AppError('You do not have permission to delete this course.', 403, 'FORBIDDEN');
    }

    await Course.findByIdAndDelete(courseId);

    await AuditService.logAction(userId, 'COURSE_DELETED', 'Course', courseId, {
      title: course.title,
    });
  }

  static async updateCourseStatus(courseId: string, status: CourseStatus, adminId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

    course.status = status;
    if (status === 'PUBLISHED' && !course.publishedAt) {
      course.publishedAt = new Date();
    }

    await course.save();

    await AuditService.logAction(adminId, `COURSE_STATUS_${status}`, 'Course', courseId, {
      title: course.title,
      newStatus: status,
    });

    return course;
  }
}
