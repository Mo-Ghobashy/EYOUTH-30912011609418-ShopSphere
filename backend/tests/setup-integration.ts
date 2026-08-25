import { prisma } from '../src/config/prisma';
import { setDbAvailable } from './db';

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    setDbAvailable(true);
  } catch {
    setDbAvailable(false);
    console.warn('PostgreSQL unavailable — integration tests will no-op.');
  }
}, 60000);

afterAll(async () => {
  await prisma.$disconnect();
}, 30000);

beforeEach(async () => {
  const { dbAvailable } = await import('./db');
  if (!dbAvailable) {
    return;
  }

  await prisma.activityLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});
