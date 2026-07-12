import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { prisma } from '../src/config/prisma';
import { setDbAvailable } from './db';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    setDbAvailable(true);
  } catch {
    setDbAvailable(false);
    console.warn('PostgreSQL unavailable — integration tests will no-op.');
  }
}, 60000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
  await prisma.$disconnect();
}, 30000);

beforeEach(async () => {
  const { dbAvailable } = await import('./db');
  if (!dbAvailable) {
    return;
  }

  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const collection of Object.values(collections)) {
      await collection.deleteMany({});
    }
  }
});
