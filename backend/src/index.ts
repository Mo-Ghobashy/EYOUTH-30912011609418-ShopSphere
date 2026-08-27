import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { logger } from './middleware/logger';

async function start(): Promise<void> {
  const server = app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      'server started',
    );
  });

  const shutdown = async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  logger.error({ err }, 'failed to start server');
  process.exit(1);
});
