import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:5000/api';

export const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test User',
  role: 'CUSTOMER' as const,
  createdAt: new Date().toISOString(),
};

export const mockProduct = {
  id: 'product-1',
  name: 'Test Headphones',
  description: 'Great sound quality',
  price: 99.99,
  stock: 10,
  imageUrl: null,
  categoryId: 'cat-1',
  createdAt: new Date().toISOString(),
  category: { id: 'cat-1', name: 'Audio', slug: 'audio' },
};

export const handlers = [
  http.post(`${API_URL}/auth/login`, async () => {
    return HttpResponse.json({ user: mockUser, token: 'mock-token' });
  }),

  http.post(`${API_URL}/auth/register`, async () => {
    return HttpResponse.json({ user: mockUser, token: 'mock-token' }, { status: 201 });
  }),

  http.get(`${API_URL}/auth/profile`, () => {
    return HttpResponse.json({ user: mockUser });
  }),

  http.get(`${API_URL}/products`, () => {
    return HttpResponse.json({
      data: [mockProduct],
      total: 1,
      page: 1,
      totalPages: 1,
    });
  }),

  http.get(`${API_URL}/products/:id`, ({ params }) => {
    return HttpResponse.json({
      data: { ...mockProduct, id: String(params.id) },
    });
  }),

  http.get(`${API_URL}/cart`, () => {
    return HttpResponse.json({ data: [] });
  }),
];
