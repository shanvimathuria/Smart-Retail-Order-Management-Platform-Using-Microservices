import React, { createContext, useContext, useMemo, useState } from 'react';
import type { CartContextType, CartItem, Product } from '../types';
import { useAuth } from './AuthContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

const readStoredCart = (cartKey: string): CartItem[] => {
  try {
    const storedCart = localStorage.getItem(cartKey);
    return storedCart ? (JSON.parse(storedCart) as CartItem[]) : [];
  } catch {
    localStorage.removeItem(cartKey);
    return [];
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartByKey, setCartByKey] = useState<Record<string, CartItem[]>>({});
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  const cartKey = useMemo(() => {
    if (isAuthenticated && user) {
      return `cart_${user.id}`;
    }
    return 'cart_guest';
  }, [isAuthenticated, user]);

  const items = useMemo(() => {
    if (isAuthLoading) {
      return [];
    }

    const cachedItems = cartByKey[cartKey];
    if (cachedItems) {
      return cachedItems;
    }

    return readStoredCart(cartKey);
  }, [cartByKey, cartKey, isAuthLoading]);

  const updateCurrentCart = (updater: (currentItems: CartItem[]) => CartItem[]) => {
    setCartByKey((currentCartByKey) => {
      const currentItems = currentCartByKey[cartKey] ?? readStoredCart(cartKey);
      const nextItems = updater(currentItems);
      localStorage.setItem(cartKey, JSON.stringify(nextItems));

      return {
        ...currentCartByKey,
        [cartKey]: nextItems,
      };
    });
  };

  const addItem = (product: Product, quantity: number = 1) => {
    updateCurrentCart((currentItems) => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...currentItems, { product, quantity }];
    });
  };

  const removeItem = (productId: string) => {
    updateCurrentCart((currentItems) => currentItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    updateCurrentCart((currentItems) =>
      currentItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    updateCurrentCart(() => []);
  };

  const getTotalPrice = (): number => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = (): number => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};