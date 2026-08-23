import { Router } from 'express';
import { InstructorController } from '../controllers/instructor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('INSTRUCTOR', 'ADMIN'));

router.get('/analytics', InstructorController.getAnalytics);

export default router;
