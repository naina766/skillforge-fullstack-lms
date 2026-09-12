import { z } from 'zod';

export const courseBodySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(300, 'Short description cannot exceed 300 characters'),
  description: z.string().min(20, 'Full description must be at least 20 characters').max(15000, 'Description cannot exceed 15000 characters'),
  type: z.enum(['COURSE', 'WORKSHOP', 'BOOTCAMP', 'WEBINAR']).optional().default('COURSE'),
  category: z.string().min(1, 'Category ID is required'),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']).optional().default('ALL_LEVELS'),
  duration: z.number().min(0).optional().default(0),
  language: z.string().max(50).optional().default('English'),
  price: z.number().min(0, 'Price cannot be negative'),
  discountedPrice: z.number().min(0).optional(),
  thumbnail: z.string().max(1000).optional(),
  skills: z.array(z.string().max(50)).optional().default([]),
  prerequisites: z.array(z.string().max(150)).optional().default([]),
  learningOutcomes: z.array(z.string().max(200)).optional().default([]),
  curriculum: z
    .array(
      z.object({
        title: z.string().min(1, 'Module title is required').max(150, 'Module title cannot exceed 150 characters'),
        order: z.number(),
        lessons: z
          .array(
            z.object({
              title: z.string().min(1, 'Lesson title is required').max(150, 'Lesson title cannot exceed 150 characters'),
              description: z.string().max(3000).optional(),
              type: z.enum(['VIDEO', 'ARTICLE', 'QUIZ', 'ASSIGNMENT']).optional().default('VIDEO'),
              videoSource: z.enum(['YOUTUBE', 'CLOUDINARY', 'NONE']).optional().default('NONE'),
              videoStatus: z.enum(['PENDING', 'UPLOADING', 'PROCESSING', 'READY', 'FAILED']).optional().default('READY'),
              youtubeVideoId: z.string().max(50).optional().default(''),
              cloudinaryPublicId: z.string().max(200).optional().default(''),
              cloudinaryUrl: z.string().max(1000).optional().default(''),
              thumbnailUrl: z.string().max(1000).optional().default(''),
              videoUrl: z.string().max(1000).optional().default(''),
              duration: z.number().optional().default(0),
              order: z.number(),
              isPreview: z.boolean().optional().default(false),
              resources: z.array(z.string().max(500)).optional().default([]),
            })
          )
          .optional()
          .default([]),
      })
    )
    .optional()
    .default([]),
  // Workshop specific optional fields
  startDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  endDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  registrationDeadline: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  location: z.string().max(200).optional(),
  meetingUrl: z.string().max(500).optional(),
  capacity: z.number().optional(),
});

export const createCourseSchema = z.object({
  body: courseBodySchema.refine(
    (data) => {
      if (data.type === 'WORKSHOP') {
        return !!data.startDate;
      }
      return true;
    },
    {
      message: 'Start date is required for live workshops.',
      path: ['startDate'],
    }
  ),
});

export const updateCourseSchema = z.object({
  body: courseBodySchema.partial(),
});

export const courseQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('12'),
    search: z.string().max(100, 'Search query must be at most 100 characters').optional(),
    category: z.string().max(100).optional(),
    level: z.string().max(50).optional(),
    type: z.string().max(50).optional(),
    minPrice: z.string().max(20).optional(),
    maxPrice: z.string().max(20).optional(),
    sort: z.string().max(50).optional().default('popular'),
  }),
});
