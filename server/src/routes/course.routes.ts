import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { ReviewController } from '../controllers/review.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCourseSchema, updateCourseSchema, courseQuerySchema } from '../validators/course.validator';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();

router.get('/', validate(courseQuerySchema), CourseController.getCourses);
router.get('/slug/:slug', optionalAuthenticate, CourseController.getCourseBySlug);
router.get('/:id', optionalAuthenticate, CourseController.getCourseById);

// Nested Review Routes
router.get('/:courseId/reviews', ReviewController.getCourseReviews);
router.get('/:courseId/my-review', authenticate, ReviewController.getMyReview);
router.post('/:courseId/reviews', authenticate, validate(createReviewSchema), ReviewController.addReview);

router.post('/', authenticate, authorize('INSTRUCTOR', 'ADMIN'), validate(createCourseSchema), CourseController.createCourse);
router.patch('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), validate(updateCourseSchema), CourseController.updateCourse);
router.delete('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), CourseController.deleteCourse);
router.patch('/:id/status', authenticate, authorize('INSTRUCTOR', 'ADMIN'), CourseController.updateCourseStatus);

export default router;
