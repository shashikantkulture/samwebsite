"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "../types";

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (sku: string) => void;
  updateQuantity: (sku: string, qty: number) => void;
  clearCart: () => void;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  couponDiscount: number; // percentage
  freeShippingThreshold: number;
  subtotal: number;
  discountValue: number;
  total: number;
  freeShippingProgress: number; // percentage (0-100)
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const freeShippingThreshold = 5000; // Rs. 5000 threshold

  // Sync cart from database
  const syncCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.cart) {
          if (data.cart.length > 0) {
            setCart(data.cart);
            localStorage.setItem("luxury_cart", JSON.stringify(data.cart));
          } else if (cart.length > 0) {
            // Server cart is empty but client has items: sync to server
            await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cart }),
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed to sync cart with database:", e);
    }
  };

  // Load cart from LocalStorage on mount and then try to sync from DB
  useEffect(() => {
    const savedCart = localStorage.getItem("luxury_cart");
    let initialCart: CartItem[] = [];
    if (savedCart) {
      try {
        initialCart = JSON.parse(savedCart);
        setCart(initialCart);
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    const savedCoupon = localStorage.getItem("luxury_coupon");
    const savedDiscount = localStorage.getItem("luxury_discount");
    if (savedCoupon && savedDiscount) {
      setAppliedCoupon(savedCoupon);
      setCouponDiscount(Number(savedDiscount));
    }

    // Call sync on mount
    fetch("/api/cart")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not logged in");
      })
      .then((data) => {
        if (data.success && data.cart) {
          if (data.cart.length > 0) {
            setCart(data.cart);
            localStorage.setItem("luxury_cart", JSON.stringify(data.cart));
          } else if (initialCart.length > 0) {
            fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cart: initialCart }),
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  // Save cart to LocalStorage and database (if logged in)
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("luxury_cart", JSON.stringify(newCart));

    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: newCart }),
    }).catch(() => {
      // Gracefully ignore 401s for non-logged in users
    });
  };

  const addToCart = (newItem: CartItem) => {
    const existingIndex = cart.findIndex((item) => item.sku === newItem.sku);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += newItem.quantity;
      saveCart(updated);
    } else {
      saveCart([...cart, newItem]);
    }
    setIsCartOpen(true); // Open drawer immediately on add to cart for high conversion UX!
  };

  const removeFromCart = (sku: string) => {
    const updated = cart.filter((item) => item.sku !== sku);
    saveCart(updated);
  };

  const updateQuantity = (sku: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(sku);
      return;
    }
    const updated = cart.map((item) => (item.sku === sku ? { ...item, quantity: qty } : item));
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    localStorage.removeItem("luxury_coupon");
    localStorage.removeItem("luxury_discount");
  };

  const applyCoupon = (code: string) => {
    const upperCode = code.toUpperCase();
    if (upperCode === "GLOW10" || upperCode === "SAMM10" || upperCode === "FIRST10") {
      setAppliedCoupon(upperCode);
      setCouponDiscount(10); // 10% discount
      localStorage.setItem("luxury_coupon", upperCode);
      localStorage.setItem("luxury_discount", "10");
      return true;
    }
    return false;
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => {
    const activePrice = item.salePrice || item.price;
    return acc + activePrice * item.quantity;
  }, 0);

  const discountValue = (subtotal * couponDiscount) / 100;
  const total = Math.max(0, subtotal - discountValue);

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        couponDiscount,
        freeShippingThreshold,
        subtotal,
        discountValue,
        total,
        freeShippingProgress,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
