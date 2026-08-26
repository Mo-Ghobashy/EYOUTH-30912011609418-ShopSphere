import { Request, Response } from 'express';
import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import { param } from '../utils/params';

export function proxyToReviewService(method: 'GET' | 'POST') {
  return asyncHandler(async (req: Request, res: Response) => {
    const reviewServiceUrl = env.REVIEW_SERVICE_URL;
    if (!reviewServiceUrl) {
      res.status(503).json({ message: 'Review service not configured' });
      return;
    }

    const productId = param(req.params.id);

    if (method === 'GET') {
      const qs = new URLSearchParams(req.query as Record<string, string>);
      qs.set('productId', productId);

      const response = await fetch(`${reviewServiceUrl}/api/reviews?${qs.toString()}`);
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const { rating, comment } = req.body;
      const authHeader = req.headers.authorization;

      const response = await fetch(`${reviewServiceUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({ productId, rating, comment }),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    }
  });
}
