import { NextFunction, Request, Response } from 'express';
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'shopsphere-backend' },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
});

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs =
      Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
        ip: req.ip,
      },
      'request completed',
    );
  });

  next();
}
