import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', EnrollmentController.enroll);
router.get('/', EnrollmentController.getUserEnrollments);
router.get('/course/:courseId', EnrollmentController.getEnrollmentByCourse);
router.get('/:id', EnrollmentController.getEnrollmentById);
router.patch('/:id/progress', EnrollmentController.updateProgress);

export default router;
