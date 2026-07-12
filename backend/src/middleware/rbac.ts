import { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError(401, 'Authentication required'));
    return;
  }

  if (req.user.role !== 'ADMIN') {
    next(new AppError(403, 'Admin access required'));
    return;
  }

  next();
}
