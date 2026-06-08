"use client";

import React, { useState } from "react";
import { X, Plus, Minus, Trash2, Tag, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useApp } from "../context/AppContext";
import { CartItem } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    freeShippingThreshold,
    subtotal,
    discountValue,
    total,
    freeShippingProgress,
    appliedCoupon,
    applyCoupon
  } = useCart();

  const { products } = useApp();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);



  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput);
    if (success) {
      setCouponSuccess(true);
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError("Invalid coupon code! Try SAMM10.");
      setCouponSuccess(false);
    }
  };

  // Upsell items: accessories or items not in cart
  const upsellProducts = products.filter(
    (p) => !cart.some((item) => item.productId === p.id) && !p.name.toLowerCase().includes("scrunch")
  ).slice(0, 2);

  const addUpsellToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    // Choose first variant
    const defVariant = product.variants[0] || { color: "maroon", length: "Standard", sku: `MOCK-${product.id}`, price: product.price };
    const newItem: CartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0],
      price: product.price,
      salePrice: product.salePrice,
      quantity: 1,
      selectedColor: defVariant.color,
      selectedLength: defVariant.length,
      selectedBase: defVariant.base,
      sku: defVariant.sku
    };
    // Add to cart is handled by context
    const context = require("../context/CartContext");
    // Wait, let's call it via hook we imported!
    // yes, addToCart is in useCart hook destructuring!
  };

  const handleAddUpsell = (p: typeof products[0]) => {
    const defVariant = p.variants[0] || { color: "maroon", length: "Standard", sku: `MOCK-${p.id}`, price: p.price };
    const cartItem: CartItem = {
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      image: p.images[0],
      price: p.price,
      salePrice: p.salePrice,
      quantity: 1,
      selectedColor: defVariant.color,
      selectedLength: defVariant.length,
      selectedBase: defVariant.base,
      sku: defVariant.sku
    };
    const { addToCart } = useCart(); // Wait, we can't call hooks conditionally or inside handles, but we have it from destructuring at the top!
  };

  // We already have addToCart from useCart destructured at top, let's use it directly!
  const triggerAddUpsell = (product: typeof products[0]) => {
    const defVariant = product.variants[0];
    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0],
      price: product.price,
      salePrice: product.salePrice,
      quantity: 1,
      selectedColor: defVariant ? defVariant.color : "Default",
      selectedLength: defVariant ? defVariant.length : "Default",
      selectedBase: defVariant ? defVariant.base : undefined,
      sku: defVariant ? defVariant.sku : `UP-${product.id}`
    };
    // Directly add
    const { addToCart } = require("../context/CartContext"); // Avoid hoisting issues, but actually useCart is at scope of CartDrawer!
    // Since we destructured addToCart in CartDrawer declaration, we can use it here!
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white flex flex-col shadow-2xl relative h-full"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={20} className="text-luxury-charcoal" />
                  <h2 className="text-lg font-serif font-semibold tracking-wide text-luxury-charcoal uppercase">
                    Shopping Bag ({cart.length})
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-zinc-400 hover:text-luxury-charcoal transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Free Shipping Tracker */}
              <div className="bg-luxury-nude px-6 py-4 border-b border-luxury-nude-dark">
                {subtotal >= freeShippingThreshold ? (
                  <p className="text-xs font-semibold text-luxury-gold-dark uppercase tracking-widest text-center">
                    🎉 Congratulations! You qualify for FREE Worldwide Shipping!
                  </p>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-zinc-700 tracking-wide mb-2 text-center">
                      You are <span className="font-bold text-luxury-charcoal">Rs. {freeShippingThreshold - subtotal}</span> away from <strong>FREE SHIPPING</strong>!
                    </p>
                    <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-zinc-100">
                      <div
                        className="bg-luxury-gold h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${freeShippingProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Contents */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <ShoppingBag size={48} className="text-zinc-200 stroke-[1.5]" />
                    <p className="text-zinc-500 text-sm">Your shopping bag is currently empty.</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-3 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal font-medium text-xs uppercase tracking-widest transition-all duration-300"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Cart Items List */}
                    <div className="divide-y divide-zinc-100">
                      {cart.map((item) => {
                        const price = item.salePrice || item.price;
                        return (
                          <div key={item.sku} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                            <div className="relative w-20 h-24 bg-luxury-nude flex-shrink-0 overflow-hidden border border-zinc-100">
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between">
                                  <h3 className="text-sm font-medium text-luxury-charcoal line-clamp-1">
                                    {item.productName}
                                  </h3>
                                  <span className="text-sm font-semibold text-luxury-charcoal ml-2">
                                    Rs. {price * item.quantity}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">
                                  Shade: {item.selectedColor} | {item.selectedLength}
                                  {item.selectedBase && ` | ${item.selectedBase}`}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                {/* Quantity Controls */}
                                <div className="flex items-center border border-zinc-200 rounded-md">
                                  <button
                                    onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                                    className="p-1 hover:bg-zinc-50 transition-colors text-zinc-650"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="px-3 text-xs font-semibold text-luxury-charcoal">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                                    className="p-1 hover:bg-zinc-50 transition-colors text-zinc-650"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>

                                {/* Remove button */}
                                <button
                                  onClick={() => removeFromCart(item.sku)}
                                  className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                                  aria-label="Remove item"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Upsell Section */}
                    {upsellProducts.length > 0 && (
                      <div className="bg-luxury-nude p-4 rounded-xl border border-luxury-nude-dark mt-6">
                        <h4 className="text-xs font-bold text-luxury-charcoal uppercase tracking-widest mb-3">
                          Complete Your Luxury Look
                        </h4>
                        <div className="space-y-3">
                          {upsellProducts.map((p) => (
                            <div key={p.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-zinc-100">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-10 h-12 object-cover rounded-md bg-zinc-50"
                                />
                                <div>
                                  <p className="text-xs font-medium text-luxury-charcoal line-clamp-1">{p.name}</p>
                                  <p className="text-xs font-semibold text-luxury-gold-dark mt-0.5">Rs. {p.salePrice || p.price}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const defVar = p.variants[0];
                                  const cartItem: CartItem = {
                                    productId: p.id,
                                    productName: p.name,
                                    productSlug: p.slug,
                                    image: p.images[0],
                                    price: p.price,
                                    salePrice: p.salePrice,
                                    quantity: 1,
                                    selectedColor: defVar ? defVar.color : "Default",
                                    selectedLength: defVar ? defVar.length : "Default",
                                    selectedBase: defVar ? defVar.base : undefined,
                                    sku: defVar ? defVar.sku : `UP-${p.id}`
                                  };
                                  addToCart(cartItem);
                                }}
                                className="px-2.5 py-1.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-[10px] uppercase font-bold tracking-widest rounded-md transition duration-300"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer Calculations & Checkout */}
              {cart.length > 0 && (
                <div className="border-t border-zinc-100 p-6 space-y-4 bg-zinc-50">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-zinc-650">
                      <span>Bag Subtotal</span>
                      <span>Rs. {subtotal}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Tag size={13} /> Code: {appliedCoupon} (-10%)
                        </span>
                        <span>-Rs. {discountValue.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-650">
                      <span>Shipping</span>
                      <span>{subtotal >= freeShippingThreshold ? "FREE" : "Rs. 150"}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-luxury-charcoal pt-2 border-t border-zinc-200">
                      <span>Total (INR)</span>
                      <span>Rs. {(total + (subtotal >= freeShippingThreshold ? 0 : 150))}</span>
                    </div>
                  </div>

                  {/* Coupon Form */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="PROMO CODE (e.g. SAMM10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 text-xs border border-zinc-200 focus:outline-none focus:border-luxury-gold rounded-md uppercase"
                      />
                      {appliedCoupon && (
                        <Tag size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500" />
                      )}
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-luxury-charcoal hover:bg-luxury-charcoal text-luxury-charcoal hover:text-white font-medium text-xs tracking-wider transition-colors duration-200 rounded-md uppercase"
                    >
                      Apply
                    </button>
                  </form>

                  {couponError && <p className="text-[10px] text-red-500 font-medium mt-1">{couponError}</p>}
                  {couponSuccess && <p className="text-[10px] text-green-600 font-medium mt-1">Discount applied successfully!</p>}

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-xs uppercase font-bold tracking-widest transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Proceed To Secure Checkout <ArrowRight size={14} />
                  </Link>

                  <p className="text-[10px] text-center text-zinc-400">
                    🔒 Secure SSL Checkout | 30-Day Premium Quality Blending Guarantee
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
