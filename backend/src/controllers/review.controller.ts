import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { createProductReview, getProductReviews } from '../services/review.service';
import { asyncHandler } from '../utils/asyncHandler';
import { param } from '../utils/params';

export const listReviews = asyncHandler(async (req: Request, res: Response) => {
  const productId = param(req.params.id);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  const result = await getProductReviews(productId, req.query);
  res.json(result);
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const productId = param(req.params.id);
  const { rating, comment } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const review = await createProductReview(productId, user.id, user.name, { rating, comment });

  res.status(201).json({ data: review });
});
