import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCategorySchema } from '../validators/category.validator';

const router = Router();

router.get('/', CategoryController.getAll);
router.post('/', authenticate, authorize('ADMIN'), validate(createCategorySchema), CategoryController.create);

export default router;
