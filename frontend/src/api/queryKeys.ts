import type { ProductListParams } from '../types';

export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params: ProductListParams = {}) => ['products', 'list', params] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    reviews: (id: string, page = 1) => ['products', id, 'reviews', page] as const,
  },
  cart: {
    all: ['cart'] as const,
  },
  stats: {
    all: ['stats'] as const,
  },
};
