export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  createdAt: string;
  category?: Category;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface StoreStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalReviews: number;
  averageRating: number;
  recentActivity: unknown[];
}

export interface ProductListParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'name' | 'newest';
  page?: number;
  limit?: number;
}

export interface CheckoutPayload {
  shipping: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
    country: string;
  };
  payment: {
    cardHolder: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
  };
}

export interface OrderConfirmation {
  orderId: string;
  status: 'PAID';
  subtotal: string;
  shipping: string;
  total: string;
  transactionRef: string;
  createdAt: string;
}
