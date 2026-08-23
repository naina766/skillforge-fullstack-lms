import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();

router.get('/course/:courseId', ReviewController.getCourseReviews);
router.post('/course/:courseId', authenticate, validate(createReviewSchema), ReviewController.addReview);
router.patch('/:id/moderate', authenticate, authorize('ADMIN'), ReviewController.moderateReview);

export default router;
