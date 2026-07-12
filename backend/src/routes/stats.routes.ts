import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, requireAdmin, statsController.getStats);

export default router;
