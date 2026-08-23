import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().min(5, 'Review comment must be at least 5 characters'),
  }),
});
