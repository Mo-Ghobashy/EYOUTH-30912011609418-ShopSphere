import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

export const reviewListQuerySchema = z.object({
  productId: z.string().uuid(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
