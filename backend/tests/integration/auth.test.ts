import request from 'supertest';
import { Role } from '@prisma/client';
import app from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { hashPassword } from '../../src/utils/password';
import { dbAvailable } from '../db';

async function createUser(
  email: string,
  role: Role,
  password = 'Password123!',
) {
  const passwordHash = await hashPassword(password);
  return prisma.user.create({
    data: { email, passwordHash, name: email.split('@')[0], role },
  });
}

describe('auth API', () => {
  it('registers a new user', async () => {
    if (!dbAvailable) return;
    const res = await request(app).post('/api/auth/register').send({
      email: 'newuser@test.com',
      password: 'Password123!',
      name: 'New User',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('newuser@test.com');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('logs in an existing user', async () => {
    if (!dbAvailable) return;
    await createUser('login@test.com', Role.CUSTOMER, 'Password123!');

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('login@test.com');
    expect(res.body.token).toBeDefined();
  });

  it('returns profile for authenticated user', async () => {
    if (!dbAvailable) return;
    const login = await request(app).post('/api/auth/register').send({
      email: 'profile@test.com',
      password: 'Password123!',
      name: 'Profile User',
    });

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('profile@test.com');
  });

  it('returns 401 without token', async () => {
    if (!dbAvailable) return;
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('returns 401 for invalid token', async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });
});
