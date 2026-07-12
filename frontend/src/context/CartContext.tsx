import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cartApi } from '../api/endpoints';
import type { CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextValue {
  items: CartItem[];
  isLoading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await cartApi.get();
      setItems(res.data.data);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      const res = await cartApi.add({ productId, quantity });
      setItems((prev) => {
        const index = prev.findIndex((item) => item.id === res.data.data.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = res.data.data;
          return next;
        }
        return [...prev, res.data.data];
      });
    },
    [],
  );

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    const res = await cartApi.update(itemId, { quantity });
    setItems((prev) => prev.map((item) => (item.id === itemId ? res.data.data : item)));
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    await cartApi.remove(itemId);
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const clearCart = useCallback(async () => {
    await cartApi.clear();
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      isLoading,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      itemCount,
      refreshCart,
    }),
    [items, isLoading, addItem, updateQuantity, removeItem, clearCart, itemCount, refreshCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
