import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '../schemas/review.schema';

const router = Router();

router.get('/', reviewController.listReviews);
router.get('/stats', reviewController.getStats);
router.post('/', authenticate, validate(createReviewSchema), reviewController.createReview);

export default router;
