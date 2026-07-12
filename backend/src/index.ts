import app from './app';
import { env } from './config/env';
import { connectMongo, disconnectMongo } from './config/mongo';
import { prisma } from './config/prisma';

async function start(): Promise<void> {
  await connectMongo();

  const server = app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await prisma.$disconnect();
    await disconnectMongo();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
