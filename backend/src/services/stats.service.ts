import { prisma } from '../config/prisma';
import { ActivityLog } from '../models/ActivityLog';
import { getReviewStats } from './review.service';

export async function getStoreStats() {
  const [totalProducts, totalUsers, reviewStats, recentActivity] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    getReviewStats(),
    ActivityLog.find().sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  return {
    totalProducts,
    totalUsers,
    totalReviews: reviewStats.totalReviews,
    averageRating: Number(reviewStats.averageRating.toFixed(2)),
    recentActivity,
  };
}
