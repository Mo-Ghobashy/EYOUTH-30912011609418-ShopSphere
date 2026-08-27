import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route not found', statusCode: 404 });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = err instanceof AppError ? err.statusCode : 500;
  let message = err instanceof AppError ? err.message : 'Internal server error';

  if (err.message.includes('Only JPEG, PNG, and WebP')) {
    statusCode = 400;
    message = err.message;
  }

  if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.message;
  }

  if (env.NODE_ENV === 'development' && !(err instanceof AppError)) {
    console.error(err);
  }

  const logPayload = {
    method: _req.method,
    url: _req.originalUrl,
    statusCode,
    message,
    err,
  };
  if (statusCode >= 500) {
    logger.error(logPayload, 'error handler: request failed');
  } else if (statusCode >= 400) {
    logger.warn(logPayload, 'error handler: request rejected');
  }

  res.status(statusCode).json({
    message,
    statusCode,
    ...(env.NODE_ENV === 'development' && !(err instanceof AppError) && { stack: err.stack }),
  });
}
