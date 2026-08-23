import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/analytics', AdminController.getAnalytics);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/role', AdminController.updateUserRoleOrStatus);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
