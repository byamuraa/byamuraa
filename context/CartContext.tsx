'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  product: string; // Product ID
  name: string;
  fabric: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number, forceQuantity?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('amuraa_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('amuraa_cart', JSON.stringify(cartItems));
      } catch (e) {
        console.error('Failed to save cart:', e);
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1, forceQuantity: boolean = false) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product === item.product);
      if (existing) {
        // Enforce stock limit
        const newQty = forceQuantity
          ? Math.min(quantity, item.stock)
          : Math.min(existing.quantity + quantity, item.stock);
        return prev.map((i) =>
          i.product === item.product ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product === productId) {
            return { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
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
