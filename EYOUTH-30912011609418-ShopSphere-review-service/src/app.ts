import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import reviewRoutes from './routes/review.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'review-service' });
});

app.use('/api/reviews', reviewRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
