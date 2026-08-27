import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import authRoutes from './routes/auth.routes';
import cartRoutes from './routes/cart.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';
import statsRoutes from './routes/stats.routes';

const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (origin === env.FRONTEND_URL) return true;
  const host = origin.startsWith('https://') ? origin.slice('https://'.length) : origin;
  if (/\.vercel\.app$/i.test(host)) return true;
  return false;
};

const app = express();

app.use(requestLogger);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

app.get('/api/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
