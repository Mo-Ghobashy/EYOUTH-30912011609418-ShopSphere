import { prisma } from '../config/prisma';
import { env } from '../config/env';

async function getReviewStats(): Promise<{ totalReviews: number; averageRating: number }> {
  if (!env.REVIEW_SERVICE_URL) {
    return { totalReviews: 0, averageRating: 0 };
  }

  try {
    const response = await fetch(`${env.REVIEW_SERVICE_URL}/api/reviews/stats`);
    if (!response.ok) {
      return { totalReviews: 0, averageRating: 0 };
    }
    const data = (await response.json()) as { totalReviews: number; averageRating: number };
    return data;
  } catch {
    return { totalReviews: 0, averageRating: 0 };
  }
}

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
