import { Router } from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import categoryRoutes from './category.routes';
import enrollmentRoutes from './enrollment.routes';
import reviewRoutes from './review.routes';
import wishlistRoutes from './wishlist.routes';
import notificationRoutes from './notification.routes';
import certificateRoutes from './certificate.routes';
import adminRoutes from './admin.routes';
import instructorRoutes from './instructor.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/categories', categoryRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/notifications', notificationRoutes);
router.use('/certificates', certificateRoutes);
router.use('/admin', adminRoutes);
router.use('/instructor', instructorRoutes);
router.use('/ai', aiRoutes);

export default router;
