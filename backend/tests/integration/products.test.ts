import request from 'supertest';
import { Role } from '@prisma/client';
import app from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { hashPassword } from '../../src/utils/password';
import { signToken } from '../../src/utils/jwt';
import { dbAvailable } from '../db';

async function seedAdminAndCategory() {
  const admin = await prisma.user.create({
    data: {
      email: 'admin-products@test.com',
      passwordHash: await hashPassword('Admin123!'),
      name: 'Admin',
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer-products@test.com',
      passwordHash: await hashPassword('Customer123!'),
      name: 'Customer',
      role: Role.CUSTOMER,
    },
  });

  const category = await prisma.category.create({
    data: { name: 'Test Category', slug: 'test-category' },
  });

  const product = await prisma.product.create({
    data: {
      name: 'Test Headphones',
      description: 'Great sound',
      price: 99.99,
      stock: 10,
      categoryId: category.id,
    },
  });

  return {
    adminToken: signToken({ id: admin.id, email: admin.email, role: admin.role }),
    customerToken: signToken({
      id: customer.id,
      email: customer.email,
      role: customer.role,
    }),
    category,
    product,
  };
}

describe('products API', () => {
  it('lists products with search filter', async () => {
    if (!dbAvailable) return;
    const { product } = await seedAdminAndCategory();

    const res = await request(app).get('/api/products').query({ search: 'Headphones' });

    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data.some((item: { id: string }) => item.id === product.id)).toBe(true);
  });

  it('allows admin to create a product', async () => {
    if (!dbAvailable) return;
    const { adminToken, category } = await seedAdminAndCategory();

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Admin Product')
      .field('description', 'Created by admin')
      .field('price', '49.99')
      .field('stock', '5')
      .field('categoryId', category.id);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Admin Product');
  });

  it('blocks customer from creating products', async () => {
    if (!dbAvailable) return;
    const { customerToken, category } = await seedAdminAndCategory();

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Blocked Product',
        description: 'Should fail',
        price: 10,
        stock: 1,
        categoryId: category.id,
      });

    expect(res.status).toBe(403);
  });
});
