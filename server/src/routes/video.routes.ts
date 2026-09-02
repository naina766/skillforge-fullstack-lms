import { Router } from 'express';
import { VideoController } from '../controllers/video.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

// Only instructors and admins can generate upload signatures
router.post(
  '/sign-upload',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  VideoController.signUpload
);

// Authenticated users can validate YouTube links
router.post(
  '/validate-youtube',
  authenticate,
  VideoController.validateYouTube
);

export default router;
