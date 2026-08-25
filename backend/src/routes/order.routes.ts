import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkoutSchema } from '../schemas/checkout.schema';

const router = Router();

// Payment endpoints are a prime target for abuse — keep this strict.
const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Too many payment attempts, please try again later', statusCode: 429 },
});

router.post('/checkout', authenticate, checkoutLimiter, validate(checkoutSchema), orderController.checkout);
router.get('/:id', authenticate, orderController.getOrder);

export default router;
