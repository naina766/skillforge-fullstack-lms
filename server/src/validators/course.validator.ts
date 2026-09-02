import { z } from 'zod';

export const courseBodySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  description: z.string().min(20, 'Full description must be at least 20 characters'),
  type: z.enum(['COURSE', 'WORKSHOP', 'BOOTCAMP', 'WEBINAR']).optional().default('COURSE'),
  category: z.string().min(1, 'Category ID is required'),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']).optional().default('ALL_LEVELS'),
  duration: z.number().min(0).optional().default(0),
  language: z.string().optional().default('English'),
  price: z.number().min(0, 'Price cannot be negative'),
  discountedPrice: z.number().min(0).optional(),
  thumbnail: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
  prerequisites: z.array(z.string()).optional().default([]),
  learningOutcomes: z.array(z.string()).optional().default([]),
  curriculum: z
    .array(
      z.object({
        title: z.string().min(1, 'Module title is required'),
        order: z.number(),
        lessons: z
          .array(
            z.object({
              title: z.string().min(1, 'Lesson title is required'),
              description: z.string().optional(),
              type: z.enum(['VIDEO', 'ARTICLE', 'QUIZ', 'ASSIGNMENT']).optional().default('VIDEO'),
              videoSource: z.enum(['YOUTUBE', 'CLOUDINARY', 'NONE']).optional().default('NONE'),
              videoStatus: z.enum(['PENDING', 'UPLOADING', 'PROCESSING', 'READY', 'FAILED']).optional().default('READY'),
              youtubeVideoId: z.string().optional().default(''),
              cloudinaryPublicId: z.string().optional().default(''),
              cloudinaryUrl: z.string().optional().default(''),
              thumbnailUrl: z.string().optional().default(''),
              videoUrl: z.string().optional().default(''),
              duration: z.number().optional().default(0),
              order: z.number(),
              isPreview: z.boolean().optional().default(false),
              resources: z.array(z.string()).optional().default([]),
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
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
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
    search: z.string().optional(),
    category: z.string().optional(),
    level: z.string().optional(),
    type: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    sort: z.string().optional().default('popular'),
  }),
});
