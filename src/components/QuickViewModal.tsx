"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Heart, Star, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useApp } from "../context/AppContext";
import { CartItem } from "../types";
import { motion } from "framer-motion";

interface QuickViewModalProps {
  productId: string | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ productId, onClose }) => {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist, products } = useApp();

  const product = products.find((p) => p.id === productId);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedBase, setSelectedBase] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState("");

  // Initialize selected variants when product changes
  useEffect(() => {
    if (product) {
      const colorOpt = product.variantOptions?.find((o) => o.name === "Color");
      const lengthOpt = product.variantOptions?.find((o) => o.name === "Length" || o.name === "Size" || o.name === "Title");
      const baseOpt = product.variantOptions?.find((o) => o.name === "Base Type");

      setSelectedColor(colorOpt ? colorOpt.values[0] : "");
      setSelectedLength(lengthOpt ? lengthOpt.values[0] : "");
      setSelectedBase(baseOpt ? baseOpt.values[0] : "");
      setQty(1);
      setActiveImg(product.images?.[0] ?? "/placeholder.png");
    }
  }, [product]);

  if (!product) return null;

  // Find exact variant combo matching the selections to check stock and price
  const matchedVariant = product.variants.find((v) => {
    const colorMatch = !selectedColor || v.color === selectedColor;
    const lengthMatch = !selectedLength || v.length === selectedLength;
    const baseMatch = !selectedBase || !v.base || v.base === selectedBase;
    return colorMatch && lengthMatch && baseMatch;
  });

  const price = matchedVariant ? matchedVariant.price : product.price;
  const salePrice = matchedVariant ? matchedVariant.salePrice : product.salePrice;
  const isOutOfStock = matchedVariant ? matchedVariant.stock <= 0 : product.stockStatus === "out_of_stock";

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const sku = matchedVariant ? matchedVariant.sku : `QV-${product.id}`;
    
    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0],
      price,
      salePrice,
      quantity: qty,
      selectedColor,
      selectedLength,
      selectedBase: selectedBase || undefined,
      sku
    };

    addToCart(item);
    onClose();
  };

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-white max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl z-10 border border-zinc-100 max-h-[90vh] md:max-h-none overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-luxury-charcoal bg-white/80 backdrop-blur-xs rounded-full border border-zinc-100 transition z-10"
        >
          <X size={18} />
        </button>

        {/* Product Images Pane */}
        <div className="bg-luxury-nude p-6 flex flex-col justify-between">
          <div className="aspect-w-3 aspect-h-4 overflow-hidden rounded-xl bg-white border border-zinc-100 flex items-center justify-center">
            <img
              src={activeImg}
              alt={product.name}
              className="w-full h-full max-h-[400px] md:max-h-[500px] object-contain"
            />
          </div>
          <div className="flex gap-2.5 mt-4 overflow-x-auto no-scrollbar">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(img)}
                className={`w-14 h-16 border rounded-lg overflow-hidden flex-shrink-0 bg-white transition ${
                  activeImg === img ? "border-luxury-gold ring-1 ring-luxury-gold" : "border-zinc-200"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info Pane */}
        <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold-dark bg-luxury-champagne px-2 py-0.5 rounded">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-700">
                <Star size={14} className="fill-luxury-gold text-luxury-gold" />
                <span>{product.rating}</span>
                <span className="text-zinc-400">({product.reviewCount} reviews)</span>
              </div>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-luxury-charcoal tracking-wide leading-tight">
              {product.name}
            </h2>

            {/* Price Row */}
            <div className="flex items-center gap-2 pt-1">
              {salePrice ? (
                <>
                  <span className="text-xl font-bold text-luxury-gold-dark">Rs. {salePrice}</span>
                  <span className="text-sm text-zinc-400 line-through">Rs. {price}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                    Save Rs. {price - salePrice}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-luxury-charcoal">Rs. {price}</span>
              )}
            </div>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed normal-case">
            {product.description}
          </p>

          {/* Swatches & Selections */}
          <div className="space-y-4 border-t border-b border-zinc-100 py-4 text-xs font-medium">
            
            {/* Color Swatch */}
            {product.variantOptions?.find((o) => o.name === "Color") && (
              <div>
                <span className="text-zinc-400 uppercase tracking-widest block mb-2 text-[10px]">
                  Select Shade: <span className="text-luxury-charcoal font-bold">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variantOptions.find((o) => o.name === "Color")?.values.map((val) => {
                    const isSelected = selectedColor === val;
                    // Mock shade coloring classes
                    const shadeBg = 
                      val.includes("Black") ? "bg-zinc-900" :
                      val.includes("Dark Brown") ? "bg-amber-950" :
                      val.includes("Chocolate") ? "bg-amber-900" :
                      val.includes("Blonde") ? "bg-amber-200" : "bg-zinc-400";
                      
                    return (
                      <button
                        key={val}
                        onClick={() => setSelectedColor(val)}
                        className={`w-7 h-7 rounded-full ${shadeBg} relative flex items-center justify-center transition border ${
                          isSelected ? "ring-2 ring-luxury-gold ring-offset-2 scale-110" : "border-black/10 hover:scale-105"
                        }`}
                        title={val}
                      >
                        {isSelected && <Check size={12} className="text-white drop-shadow-xs" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Length Swatch (Sizing/Title dynamic option) */}
            {product.variantOptions?.find((o) => o.name === "Length" || o.name === "Size" || o.name === "Title") && (
              <div>
                <span className="text-zinc-400 uppercase tracking-widest block mb-2 text-[10px]">
                  Select {product.variantOptions.find((o) => o.name === "Length" || o.name === "Size" || o.name === "Title")?.name}: <span className="text-luxury-charcoal font-bold">{selectedLength}</span>
                </span>
                <div className="flex gap-2">
                  {product.variantOptions.find((o) => o.name === "Length" || o.name === "Size" || o.name === "Title")?.values.map((val) => (
                    <button
                      key={val}
                      onClick={() => setSelectedLength(val)}
                      className={`px-3 py-1.5 border rounded-lg text-[10px] tracking-widest transition uppercase ${
                        selectedLength === val
                          ? "border-luxury-charcoal bg-luxury-charcoal text-white font-bold"
                          : "border-zinc-200 hover:border-zinc-400 text-zinc-650 bg-white"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Base Type Swatch */}
            {product.variantOptions?.find((o) => o.name === "Base Type") && (
              <div>
                <span className="text-zinc-400 uppercase tracking-widest block mb-2 text-[10px]">
                  Select Base Type: <span className="text-luxury-charcoal font-bold">{selectedBase}</span>
                </span>
                <div className="flex gap-2">
                  {product.variantOptions.find((o) => o.name === "Base Type")?.values.map((val) => (
                    <button
                      key={val}
                      onClick={() => setSelectedBase(val)}
                      className={`px-3 py-1.5 border rounded-lg text-[10px] tracking-widest transition uppercase ${
                        selectedBase === val
                          ? "border-luxury-charcoal bg-luxury-charcoal text-white font-bold"
                          : "border-zinc-200 hover:border-zinc-400 text-zinc-600 bg-white"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="space-y-4">
            
            {/* Stock status indicator */}
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest">
              <span className={`w-2 h-2 rounded-full ${
                isOutOfStock ? "bg-red-500" : matchedVariant?.stock && matchedVariant.stock < 5 ? "bg-amber-500 animate-pulse" : "bg-green-500"
              }`} />
              <span className={
                isOutOfStock ? "text-red-500" : matchedVariant?.stock && matchedVariant.stock < 5 ? "text-amber-600" : "text-green-600"
              }>
                {isOutOfStock ? "Sold Out" : matchedVariant?.stock && matchedVariant.stock < 5 ? `Only ${matchedVariant.stock} items left!` : "In Stock - Ready to Ship"}
              </span>
            </div>

            <div className="flex gap-4">
              {/* Qty Selector */}
              <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 px-1">
                <button
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  className="p-2 text-zinc-500 hover:text-luxury-charcoal transition"
                  disabled={isOutOfStock}
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-xs font-bold text-luxury-charcoal">{qty}</span>
                <button
                  onClick={() => setQty((prev) => prev + 1)}
                  className="p-2 text-zinc-500 hover:text-luxury-charcoal transition"
                  disabled={isOutOfStock}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add To Bag CTA */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 text-center text-xs uppercase font-bold tracking-widest rounded-lg transition-all duration-300 ${
                  isOutOfStock
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                    : "bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal"
                }`}
              >
                {isOutOfStock ? "Sold Out" : "Add to Bag"}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 border rounded-lg transition ${
                  isWishlisted 
                    ? "border-red-500 text-red-500 bg-red-50/50" 
                    : "border-zinc-200 text-zinc-400 hover:text-luxury-charcoal hover:border-zinc-400"
                }`}
                aria-label="Wishlist"
              >
                <Heart size={18} className={isWishlisted ? "fill-red-500" : ""} />
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
export default QuickViewModal;
