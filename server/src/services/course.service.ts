import { Course, ICourse, CourseStatus, CourseType } from '../models/Course';
import { Category } from '../models/Category';
import { Enrollment } from '../models/Enrollment';
import { AppError } from '../utils/appError';
import { createSlug } from '../utils/slugify';
import { escapeRegex } from '../utils/sanitize';
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
  private static sanitizeCurriculumForGuest(curriculum: any[]) {
    if (!curriculum || !Array.isArray(curriculum)) return [];
    return curriculum.map((module) => ({
      ...module,
      lessons: (module.lessons || []).map((lesson: any) => {
        if (lesson.isPreview) {
          return lesson;
        }
        const {
          youtubeVideoId,
          cloudinaryPublicId,
          cloudinaryUrl,
          videoUrl,
          resources,
          ...safeLesson
        } = lesson;
        return safeLesson;
      }),
    }));
  }

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

    if (
      filters.category &&
      filters.category.trim() &&
      !['ALL', 'all', 'all-categories'].includes(filters.category.trim())
    ) {
      // Find category by slug or id
      const cat = await Category.findOne({
        $or: [
          { _id: filters.category.match(/^[0-9a-fA-F]{24}$/) ? filters.category : null },
          { slug: filters.category.trim() },
        ],
      });
      if (cat) {
        query.category = cat._id;
      }
    }

    if (
      filters.level &&
      filters.level.trim() &&
      !['ALL', 'ALL_LEVELS', 'all'].includes(filters.level.trim().toUpperCase())
    ) {
      query.level = filters.level.trim().toUpperCase();
    }

    if (
      filters.type &&
      filters.type.trim() &&
      !['ALL', 'all'].includes(filters.type.trim().toUpperCase())
    ) {
      query.type = filters.type.trim().toUpperCase();
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (filters.search && filters.search.trim()) {
      const safeSearch = escapeRegex(filters.search.trim());
      const searchRegex = new RegExp(safeSearch, 'i');
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
        .select('-curriculum')
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

  static async getCourseBySlug(slug: string, user?: { userId: string; role: string }) {
    const course = await Course.findOne({ slug })
      .populate('category', 'name slug icon description')
      .populate('instructor', 'name avatar bio skills')
      .lean();

    if (!course) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

    const instructorId = (course.instructor as any)?._id?.toString() || (course.instructor as any)?.toString();
    const isInstructor = !!(user?.userId && instructorId === user.userId);
    const isAdmin = user?.role === 'ADMIN';

    if (course.status !== 'PUBLISHED' && !isInstructor && !isAdmin) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

    let isEnrolled = false;
    if (user?.userId && !isInstructor && !isAdmin) {
      isEnrolled = !!(await Enrollment.exists({
        student: user.userId,
        course: course._id,
        status: { $ne: 'CANCELLED' },
      }));
    }

    const hasFullAccess = isAdmin || isInstructor || isEnrolled;

    if (!hasFullAccess && course.curriculum) {
      course.curriculum = this.sanitizeCurriculumForGuest(course.curriculum);
    }

    return course;
  }

  static async getCourseById(id: string, user?: { userId: string; role: string }) {
    const course = await Course.findById(id)
      .populate('category', 'name slug icon')
      .populate('instructor', 'name avatar bio')
      .lean();

    if (!course) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

    const instructorId = (course.instructor as any)?._id?.toString() || (course.instructor as any)?.toString();
    const isInstructor = !!(user?.userId && instructorId === user.userId);
    const isAdmin = user?.role === 'ADMIN';

    if (course.status !== 'PUBLISHED' && !isInstructor && !isAdmin) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

    let isEnrolled = false;
    if (user?.userId && !isInstructor && !isAdmin) {
      isEnrolled = !!(await Enrollment.exists({
        student: user.userId,
        course: course._id,
        status: { $ne: 'CANCELLED' },
      }));
    }

    const hasFullAccess = isAdmin || isInstructor || isEnrolled;

    if (!hasFullAccess && course.curriculum) {
      course.curriculum = this.sanitizeCurriculumForGuest(course.curriculum);
    }

    return course;
  }

  static async createCourse(instructorId: string, data: Partial<ICourse>) {
    let slug = createSlug(data.title || 'untitled-course');
    const existingSlug = await Course.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const initialStatus = (data.status as any) === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';

    const course = await Course.create({
      ...data,
      slug,
      instructor: instructorId,
      status: initialStatus,
      publishedAt: initialStatus === 'PUBLISHED' ? new Date() : undefined,
    });

    await AuditService.logAction(instructorId, 'COURSE_CREATED', 'Course', (course._id as any).toString(), {
      title: course.title,
      status: course.status,
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

  static async updateCourseStatus(courseId: string, status: CourseStatus, userId: string, isUserAdmin: boolean = false) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
    }

    if (!isUserAdmin && course.instructor.toString() !== userId) {
      throw new AppError('You do not have permission to update status for this course.', 403, 'FORBIDDEN');
    }

    course.status = status;
    if (status === 'PUBLISHED' && !course.publishedAt) {
      course.publishedAt = new Date();
    }

    await course.save();

    await AuditService.logAction(userId, `COURSE_STATUS_${status}`, 'Course', courseId, {
      title: course.title,
      newStatus: status,
    });

    return course;
  }
}
