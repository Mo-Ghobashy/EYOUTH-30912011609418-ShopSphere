import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';

const router = Router();

router.get('/', categoryController.listCategories);
router.post('/', authenticate, requireAdmin, validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', authenticate, requireAdmin, validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);

export default router;
