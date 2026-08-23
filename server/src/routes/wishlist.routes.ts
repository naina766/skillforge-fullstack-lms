import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', WishlistController.getWishlist);
router.post('/:courseId', WishlistController.addToWishlist);
router.delete('/:courseId', WishlistController.removeFromWishlist);

export default router;
