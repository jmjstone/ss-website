'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number; // in cents
  discount?: number;
  quantity: number;
  image_url?: string | null;
  promoToken?: string; // <-- NEW: signed token carried to checkout API
  appliedPromoDiscount?: number; // <-- NEW: discount % applied from promoToken
}

interface CartContextProps {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  lastAddedItem?: CartItem | null;
  showPopdown: boolean;
  closePopdown: () => void;
  updateQuantity: (id: string, quantity: number) => void; // NEW
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [showPopdown, setShowPopdown] = useState(false);
  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);

      if (exists) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1, promoToken: item.promoToken || i.promoToken } // ✅ preserve promoToken if passed
            : i,
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
    // Show popdown for the last added item
    setLastAddedItem({ ...item, quantity: 1 });
    setShowPopdown(true);

    // Auto-hide after 5 seconds
    setTimeout(() => setShowPopdown(false), 5000);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const closePopdown = () => setShowPopdown(false);

  const getTotal = () =>
    cart.reduce((acc, item) => {
      // base price from item
      let price = item.price;

      // optionally apply discount from DB
      if (item.discount) {
        price = Math.round(price * (1 - item.discount / 100));
      }

      // Apply promo discount (from verified token, stored when added)
      if (item.appliedPromoDiscount) {
        price = Math.round(price * (1 - item.appliedPromoDiscount / 100));
      }
      return acc + price * item.quantity;
    }, 0);

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return; // optional: prevent quantity < 1
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getTotal,
        lastAddedItem,
        showPopdown,
        closePopdown,
        updateQuantity, // NEW
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
