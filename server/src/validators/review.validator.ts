import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    rating: z
      .number({ required_error: 'Rating is required' })
      .min(1, 'Rating must be between 1 and 5')
      .max(5, 'Rating must be between 1 and 5'),
    comment: z
      .string()
      .trim()
      .max(1000, 'Comment cannot exceed 1000 characters')
      .optional()
      .default(''),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z
      .number()
      .min(1, 'Rating must be between 1 and 5')
      .max(5, 'Rating must be between 1 and 5')
      .optional(),
    comment: z
      .string()
      .trim()
      .max(1000, 'Comment cannot exceed 1000 characters')
      .optional(),
  }),
});
