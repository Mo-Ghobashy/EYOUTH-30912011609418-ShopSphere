import { prisma } from '../config/prisma';
import { reviewListQuerySchema } from '../schemas/review.schema';

export async function getProductReviews(productId: string, query: unknown) {
  const { page, limit } = reviewListQuerySchema.parse(query);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function createProductReview(
  productId: string,
  userId: string,
  userName: string,
  input: { rating: number; comment: string },
) {
  return prisma.review.create({
    data: {
      productId,
      userId,
      userName,
      rating: input.rating,
      comment: input.comment,
    },
  });
}

export async function getReviewStats() {
  const [totalReviews, agg] = await Promise.all([
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
  ]);

  return {
    totalReviews,
    averageRating: agg._avg.rating ?? 0,
  };
}
