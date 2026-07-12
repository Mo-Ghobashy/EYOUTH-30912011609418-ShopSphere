import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { upload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '../schemas/review.schema';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

const router = Router();

router.get('/', productController.listProducts);
router.get('/:id/reviews', reviewController.listReviews);
router.post(
  '/:id/reviews',
  authenticate,
  validate(createReviewSchema),
  reviewController.createReview,
);
router.get('/:id', productController.getProduct);
router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.single('image'),
  validate(createProductSchema),
  productController.createProduct,
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  upload.single('image'),
  validate(updateProductSchema),
  productController.updateProduct,
);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

export default router;
