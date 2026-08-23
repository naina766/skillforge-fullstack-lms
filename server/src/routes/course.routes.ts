import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCourseSchema, updateCourseSchema, courseQuerySchema } from '../validators/course.validator';

const router = Router();

router.get('/', validate(courseQuerySchema), CourseController.getCourses);
router.get('/slug/:slug', CourseController.getCourseBySlug);
router.get('/:id', CourseController.getCourseById);

router.post('/', authenticate, authorize('INSTRUCTOR', 'ADMIN'), validate(createCourseSchema), CourseController.createCourse);
router.patch('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), validate(updateCourseSchema), CourseController.updateCourse);
router.delete('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), CourseController.deleteCourse);
router.patch('/:id/status', authenticate, authorize('ADMIN'), CourseController.updateCourseStatus);

export default router;
