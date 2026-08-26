import { NextFunction, Request, Response } from 'express';
import { AppError } from './auth';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route not found', statusCode: 404 });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal server error';

  res.status(statusCode).json({ message, statusCode });
}
