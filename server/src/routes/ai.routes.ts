import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { aiRateLimiter } from '../middleware/rateLimit.middleware';
import { mentorPromptSchema } from '../validators/ai.validator';

const router = Router();

router.use(authenticate);

router.post('/mentor', aiRateLimiter, validate(mentorPromptSchema), AIController.chatMentor);
router.get('/recommendations', AIController.getRecommendations);

export default router;
