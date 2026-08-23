import React, { createContext, useContext, useState, useCallback } from "react";
import { Product, CartItem } from "@/lib/api";

interface CartContextType {
  items: CartItem[];
  savedItems: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    variants?: Record<string, string>,
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  removeSaved: (productId: string) => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback(
    (product: Product, quantity = 1, variants?: Record<string, string>) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, { product, quantity, selectedVariants: variants }];
      });
      setIsCartOpen(true);
    },
    [],
  );

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    );
  }, []);

  const saveForLater = useCallback((productId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item) {
        setSavedItems((s) => [...s, item]);
        return prev.filter((i) => i.product.id !== productId);
      }
      return prev;
    });
  }, []);

  const moveToCart = useCallback((productId: string) => {
    setSavedItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item) {
        setItems((c) => [...c, item]);
        return prev.filter((i) => i.product.id !== productId);
      }
      return prev;
    });
  }, []);

  const removeSaved = useCallback((productId: string) => {
    setSavedItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        savedItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        saveForLater,
        moveToCart,
        removeSaved,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
