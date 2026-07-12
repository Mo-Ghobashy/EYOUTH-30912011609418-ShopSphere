import type {
  CartItem,
  Category,
  PaginatedResponse,
  Product,
  ProductListParams,
  Review,
  StoreStats,
  User,
} from '../types';
import { apiClient } from './client';

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post<{ user: User; token: string }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<{ user: User; token: string }>('/auth/login', data),

  getProfile: () => apiClient.get<{ user: User }>('/auth/profile'),

  updateProfile: (data: { name?: string }) =>
    apiClient.patch<{ user: User }>('/auth/profile', data),
};

export const categoriesApi = {
  list: () => apiClient.get<{ data: Category[] }>('/categories'),

  create: (data: { name: string; slug: string }) =>
    apiClient.post<{ data: Category }>('/categories', data),

  update: (id: string, data: { name?: string; slug?: string }) =>
    apiClient.put<{ data: Category }>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete(`/categories/${id}`),
};

export const productsApi = {
  list: (params?: ProductListParams) =>
    apiClient.get<PaginatedResponse<Product>>('/products', { params }),

  getById: (id: string) => apiClient.get<{ data: Product }>(`/products/${id}`),

  create: (formData: FormData) =>
    apiClient.post<{ data: Product }>('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, formData: FormData) =>
    apiClient.put<{ data: Product }>(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => apiClient.delete(`/products/${id}`),
};

export const cartApi = {
  get: () => apiClient.get<{ data: CartItem[] }>('/cart'),

  add: (data: { productId: string; quantity: number }) =>
    apiClient.post<{ data: CartItem }>('/cart', data),

  update: (itemId: string, data: { quantity: number }) =>
    apiClient.patch<{ data: CartItem }>(`/cart/${itemId}`, data),

  remove: (itemId: string) => apiClient.delete(`/cart/${itemId}`),

  clear: () => apiClient.delete('/cart'),
};

export const reviewsApi = {
  list: (productId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Review>>(`/products/${productId}/reviews`, { params }),

  create: (productId: string, data: { rating: number; comment: string }) =>
    apiClient.post<{ data: Review }>(`/products/${productId}/reviews`, data),
};

export const statsApi = {
  get: () => apiClient.get<StoreStats>('/stats'),
};
