'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type CartStep = 'cart' | 'checkout' | 'confirmation';

export interface CartItem {
  key: string; // `${productId}-${saleModeId}`
  productId: number;
  saleModeId: number;
  productName: string;
  brandName: string;
  saleModeType: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

interface CartUIContextValue {
  isCartOpen: boolean;
  activeStep: CartStep;
  isSearchOpen: boolean;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  openCart: (initialStep?: CartStep) => void;
  closeCart: () => void;
  setStep: (step: CartStep) => void;
  openSearch: () => void;
  closeSearch: () => void;
  addItem: (item: Omit<CartItem, 'key'>) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'coupage_cart';

const CartUIContext = createContext<CartUIContextValue | undefined>(undefined);

export function CartUIProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<CartStep>('cart');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignorar errores de lectura de localStorage
    }
    return [];
  });

  // Sincronizar con localStorage cuando cambian los ítems
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [items]);

  const openCart = useCallback((initialStep: CartStep = 'cart') => {
    setActiveStep(initialStep);
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const setStep = useCallback((step: CartStep) => {
    setActiveStep(step);
  }, []);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  // T21: Si el producto + modalidad ya existe, incrementa su cantidad sin duplicar fila
  const addItem = useCallback((newItem: Omit<CartItem, 'key'>) => {
    const itemKey = `${newItem.productId}-${newItem.saleModeId}`;
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.key === itemKey);
      if (existingIndex > -1) {
        return prev.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      }
      return [...prev, { ...newItem, key: itemKey }];
    });
    setActiveStep('cart');
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  // T21: Reducir a 0 elimina el producto
  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.key !== key));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [items]
  );

  return (
    <CartUIContext.Provider
      value={{
        isCartOpen,
        activeStep,
        isSearchOpen,
        items,
        totalItems,
        totalAmount,
        openCart,
        closeCart,
        setStep,
        openSearch,
        closeSearch,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI(): CartUIContextValue {
  const context = useContext(CartUIContext);
  if (!context) {
    throw new Error('useCartUI debe utilizarse dentro de un CartUIProvider');
  }
  return context;
}
