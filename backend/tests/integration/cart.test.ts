import request from 'supertest';
import { Role } from '@prisma/client';
import app from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { hashPassword } from '../../src/utils/password';
import { signToken } from '../../src/utils/jwt';
import { dbAvailable } from '../db';

async function seedCartData() {
  const user = await prisma.user.create({
    data: {
      email: 'cart-user@test.com',
      passwordHash: await hashPassword('Password123!'),
      name: 'Cart User',
      role: Role.CUSTOMER,
    },
  });

  const category = await prisma.category.create({
    data: { name: 'Cart Category', slug: 'cart-category' },
  });

  const product = await prisma.product.create({
    data: {
      name: 'Cart Product',
      description: 'For cart tests',
      price: 25,
      stock: 20,
      categoryId: category.id,
    },
  });

  return {
    token: signToken({ id: user.id, email: user.email, role: user.role }),
    product,
  };
}

describe('cart API', () => {
  it('adds an item to the cart', async () => {
    if (!dbAvailable) return;
    const { token, product } = await seedCartData();

    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product.id, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(2);
    expect(res.body.data.product.id).toBe(product.id);
  });

  it('updates and removes cart items', async () => {
    if (!dbAvailable) return;
    const { token, product } = await seedCartData();

    const addRes = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product.id, quantity: 1 });

    const itemId = addRes.body.data.id;

    const updateRes = await request(app)
      .patch(`/api/cart/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 3 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.quantity).toBe(3);

    const removeRes = await request(app)
      .delete(`/api/cart/${itemId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(removeRes.status).toBe(204);

    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(cartRes.body.data).toHaveLength(0);
  });
});
