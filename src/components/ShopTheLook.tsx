"use client";

import React, { useState } from "react";
import { Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { CartItem } from "../types";
import Link from "next/link";

interface Hotspot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  productId: string;
  label: string;
}

export const ShopTheLook: React.FC = () => {
  const { addToCart } = useCart();
  const { products } = useApp();
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const HOTSPOTS: Hotspot[] = [
    {
      id: "h1",
      x: 48,
      y: 24,
      productId: "p1",
      label: "Corset Jumpsuit"
    },
    {
      id: "h2",
      x: 62,
      y: 72,
      productId: "p2",
      label: "Girls' Fairy-Style Gown"
    }
  ];

  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const defVar = product.variants[0];
    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0],
      price: product.price,
      salePrice: product.salePrice,
      quantity: 1,
      selectedColor: defVar ? defVar.color : "maroon",
      selectedLength: defVar ? defVar.length : "Standard",
      selectedBase: defVar ? defVar.base : undefined,
      sku: defVar ? defVar.sku : `STL-${product.id}`
    };
    addToCart(item);
    setActiveHotspot(null);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border border-zinc-100 shadow-sm font-sans select-none aspect-w-3 aspect-h-4 h-[550px] md:h-[650px]">
      
      {/* Model Background */}
      <img
        src="https://cdn.shopify.com/s/files/1/0932/4796/3414/files/PRELIMENARY-34.png?v=1771478209"
        alt="SAMM Renaissance editorial model lookbook"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      {/* Render Hotspots */}
      {HOTSPOTS.map((h) => {
        const isActive = activeHotspot === h.id;
        const matchedProduct = products.find((p) => p.id === h.productId);
        
        return (
          <div
            key={h.id}
            className="absolute z-10"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            {/* Hotspot Ring Indicator */}
            <button
              onClick={() => setActiveHotspot(isActive ? null : h.id)}
              className={`w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg border border-luxury-gold transition duration-300 relative ${
                isActive ? "scale-115 rotate-45 bg-luxury-gold text-white" : "hover:scale-110 text-luxury-charcoal"
              }`}
              aria-label={`Featured look: ${h.label}`}
            >
              {isActive ? <X size={14} /> : <Plus size={14} className="animate-pulse" />}
              {!isActive && (
                <span className="absolute inset-0 rounded-full border border-white animate-ping opacity-60 pointer-events-none" />
              )}
            </button>

            {/* Product Popup Card */}
            {isActive && matchedProduct && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-zinc-100 flex gap-3 animate-fade-in z-20">
                <img
                  src={matchedProduct.images[0]}
                  alt={matchedProduct.name}
                  className="w-16 h-20 object-cover rounded-lg bg-zinc-50 border border-zinc-100 flex-shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold text-luxury-charcoal line-clamp-2 leading-snug">
                      {matchedProduct.name}
                    </h4>
                    <p className="text-[11px] font-semibold text-luxury-gold-dark mt-1">
                      Rs. {matchedProduct.salePrice || matchedProduct.price}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-zinc-100">
                    <button
                      onClick={() => handleAddProduct(h.productId)}
                      className="flex items-center gap-1 text-[9px] uppercase font-bold text-luxury-gold-dark hover:text-luxury-charcoal tracking-widest transition"
                    >
                      <ShoppingBag size={10} /> Add to Bag
                    </button>
                    <Link
                      href={`/product/${matchedProduct.slug}`}
                      className="text-[9px] uppercase text-zinc-400 hover:text-zinc-650 tracking-wider flex items-center gap-0.5"
                    >
                      Specs <ArrowRight size={8} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="absolute left-6 bottom-6 text-white space-y-1">
        <span className="text-[9px] uppercase font-bold tracking-widest text-luxury-champagne bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded">
          Shop The Campaign Look
        </span>
        <h4 className="font-serif text-lg font-bold tracking-wide text-white drop-shadow-xs">
          Designer Couture & Gowns
        </h4>
      </div>

    </div>
  );
};
export default ShopTheLook;
