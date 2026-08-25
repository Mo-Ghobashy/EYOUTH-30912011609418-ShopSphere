import { prisma } from '../config/prisma';
import { getReviewStats } from './review.service';

export async function getStoreStats() {
  const [totalProducts, totalUsers, totalOrders, revenueAgg, reviewStats, recentActivity] =
    await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      getReviewStats(),
      prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

  return {
    totalProducts,
    totalUsers,
    totalOrders,
    totalRevenue: Number(revenueAgg._sum.total ?? 0),
    totalReviews: reviewStats.totalReviews,
    averageRating: Number(reviewStats.averageRating.toFixed(2)),
    recentActivity,
  };
}
