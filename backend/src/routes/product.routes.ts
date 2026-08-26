import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { upload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';
import { proxyToReviewService } from '../services/review.proxy';

const router = Router();

router.get('/', productController.listProducts);
router.get('/:id/reviews', proxyToReviewService('GET'));
router.post('/:id/reviews', authenticate, proxyToReviewService('POST'));
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
