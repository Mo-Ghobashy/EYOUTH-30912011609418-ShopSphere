import dotenv from 'dotenv';

dotenv.config();

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
process.env.UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ecommerce';
process.env.DIRECT_DATABASE_URL =
  process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

// Integration tests wipe all data — isolate them in a dedicated database so
// the development/seeded database is never touched.
const toTestDatabaseUrl = (url: string): string =>
  url.replace(/\/([^/?]+)(\?.*)?$/, '/ecommerce_test$2');

if (process.env.NODE_ENV === 'test') {
  process.env.DATABASE_URL = toTestDatabaseUrl(process.env.DATABASE_URL);
  process.env.DIRECT_DATABASE_URL = toTestDatabaseUrl(process.env.DIRECT_DATABASE_URL);
}
