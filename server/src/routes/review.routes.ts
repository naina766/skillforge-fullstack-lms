import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema, updateReviewSchema } from '../validators/review.validator';

const router = Router();

// Admin Routes
router.get('/', authenticate, authorize('ADMIN'), ReviewController.getAllReviews);
router.patch('/:id/moderate', authenticate, authorize('ADMIN'), ReviewController.moderateReview);

// Public & Student Course Reviews
router.get('/course/:courseId', ReviewController.getCourseReviews);
router.get('/course/:courseId/my-review', authenticate, ReviewController.getMyReview);
router.post('/course/:courseId', authenticate, validate(createReviewSchema), ReviewController.addReview);

// Review Management (Owner or Admin)
router.patch('/:id', authenticate, validate(updateReviewSchema), ReviewController.updateReview);
router.delete('/:id', authenticate, ReviewController.deleteReview);

export default router;
