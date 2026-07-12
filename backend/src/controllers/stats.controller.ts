import { Request, Response } from 'express';
import { getStoreStats } from '../services/stats.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getStoreStats();
  res.json(stats);
});
