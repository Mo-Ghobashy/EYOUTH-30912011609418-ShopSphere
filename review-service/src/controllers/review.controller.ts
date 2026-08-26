import { Request, Response } from 'express';
import { AppError } from '../middleware/auth';
import { createProductReview, getProductReviews, getReviewStats } from '../services/review.service';
import { asyncHandler } from '../utils/asyncHandler';

export const listReviews = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.query.productId as string;

  if (!productId) {
    throw new AppError(400, 'productId query parameter is required');
  }

  const result = await getProductReviews(productId, req.query);
  res.json(result);
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { productId, rating, comment } = req.body;
  const user = req.user!;

  const review = await createProductReview(productId, user.id, user.email, { rating, comment });
  res.status(201).json({ data: review });
});

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getReviewStats();
  res.json(stats);
});
