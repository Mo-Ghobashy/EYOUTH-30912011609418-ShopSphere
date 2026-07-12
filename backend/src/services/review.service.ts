import { Review } from '../models/Review';
import { reviewListQuerySchema } from '../schemas/review.schema';

export async function getProductReviews(productId: string, query: unknown) {
  const { page, limit } = reviewListQuerySchema.parse(query);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Review.find({ productId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments({ productId }),
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
  return Review.create({
    productId,
    userId,
    userName,
    rating: input.rating,
    comment: input.comment,
  });
}

export async function getReviewStats() {
  const [totalReviews, avgResult] = await Promise.all([
    Review.countDocuments(),
    Review.aggregate<{ _id: null; avgRating: number }>([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]),
  ]);

  return {
    totalReviews,
    averageRating: avgResult[0]?.avgRating ?? 0,
  };
}
