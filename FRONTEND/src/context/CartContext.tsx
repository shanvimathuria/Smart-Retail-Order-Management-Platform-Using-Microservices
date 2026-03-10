import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartContextType, CartItem, Product } from '../types';
import { useAuth } from './AuthContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  // Get cart key based on user
  const getCartKey = () => {
    if (isAuthenticated && user) {
      return `cart_${user.id}`;
    }
    return 'cart_guest';
  };

  // Load cart from localStorage when user changes or app starts
  useEffect(() => {
    if (isAuthLoading) return; // Don't load cart while authentication is loading
    
    const cartKey = getCartKey();
    const storedCart = localStorage.getItem(cartKey);
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    } else {
      setItems([]); // Clear cart if no data for current user
    }
  }, [user, isAuthenticated, isAuthLoading]);

  // Save cart to localStorage whenever items change, but only if not loading
  useEffect(() => {
    if (isAuthLoading) return;
    
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(items));
  }, [items, user, isAuthenticated, isAuthLoading]);

  const addItem = (product: Product, quantity: number = 1) => {
    setItems(currentItems => {
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
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
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