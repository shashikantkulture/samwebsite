"use client";

import React, { useState } from "react";
import { Star, Heart, Eye, ShoppingCart } from "lucide-react";
import { Product, CartItem } from "../types";
import { useCart } from "../context/CartContext";
import { useApp } from "../context/AppContext";
import Link from "next/link";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  onQuickView: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useApp();

  // Defensive: ensure arrays exist
  const safeImages: string[] = Array.isArray(product?.images) ? product.images : [];
  const safeVariants = Array.isArray(product?.variants) ? product.variants : [];
  const safeVariantOptions = Array.isArray(product?.variantOptions) ? product.variantOptions : [];

  const colorOpt = safeVariantOptions.find((o) => o.name === "Color");
  const firstColor = colorOpt?.values?.[0] ?? "";

  const [activeImg, setActiveImg] = useState(safeImages[0] ?? "/placeholder.png");
  const [selectedColor, setSelectedColor] = useState(firstColor);

  const isWishlisted = wishlist.includes(product?.id ?? "");

  // Find price based on active color selection
  const matchedVariant = safeVariants.find(
    (v) => !selectedColor || v.color === selectedColor
  );

  const activePrice = matchedVariant ? matchedVariant.price : (product?.price ?? 0);
  const activeSalePrice = matchedVariant ? matchedVariant.salePrice : product?.salePrice;
  const isOutOfStock = product?.stockStatus === "out_of_stock";

  // Guard: don't render if no product
  if (!product?.id) return null;

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    const defVariant = matchedVariant || safeVariants[0];
    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: safeImages[0] ?? "/placeholder.png",
      price: activePrice,
      salePrice: activeSalePrice,
      quantity: 1,
      selectedColor: selectedColor || (defVariant ? defVariant.color : "Default"),
      selectedLength: defVariant ? defVariant.length : "Standard",
      selectedBase: defVariant ? defVariant.base : undefined,
      sku: defVariant ? defVariant.sku : `PC-${product.id}`
    };
    addToCart(item);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative flex flex-col bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-shadow duration-300 font-sans"
    >
      
      {/* Product Image Pane */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-w-3 aspect-h-4 h-72 bg-luxury-nude overflow-hidden">
        <img
          src={activeImg}
          alt={product.name}
          className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${
            "object-contain"
          }`}
        />

        {/* Dynamic badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="bg-luxury-gold text-white text-[8px] uppercase tracking-widest px-2.5 py-1 font-bold rounded">
              New
            </span>
          )}
          {activeSalePrice && (
            <span className="bg-red-500 text-white text-[8px] uppercase tracking-widest px-2.5 py-1 font-bold rounded">
              Sale
            </span>
          )}
        </div>

        {/* Quick View and Wishlist Actions overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product.id);
            }}
            className="w-10 h-10 rounded-full bg-white text-luxury-charcoal hover:bg-luxury-gold hover:text-luxury-charcoal flex items-center justify-center shadow-lg transition duration-200 transform translate-y-4 group-hover:translate-y-0"
            title="Quick View"
          >
            <Eye size={16} />
          </button>
          
          <button
            onClick={handleAddClick}
            className="w-10 h-10 rounded-full bg-white text-luxury-charcoal hover:bg-luxury-gold hover:text-luxury-charcoal flex items-center justify-center shadow-lg transition duration-200 transform translate-y-4 group-hover:translate-y-0 delay-75"
            title="Add to Bag"
            disabled={isOutOfStock}
          >
            <ShoppingCart size={16} />
          </button>
        </div>

        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition duration-200 z-10 ${
            isWishlisted 
              ? "bg-red-50 text-red-500 border border-red-200/50" 
              : "bg-white/80 hover:bg-white text-zinc-400 hover:text-luxury-charcoal border border-zinc-100"
          }`}
          aria-label="Wishlist toggle"
        >
          <Heart size={14} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
        </button>
      </Link>

      {/* Info Pane */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-1">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
            <span>{product.category}</span>
            <div className="flex items-center gap-0.5 text-zinc-650">
              <Star size={10} className="fill-luxury-gold text-luxury-gold" />
              <span className="font-semibold">{product.rating}</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`}>
            <h4 className="text-xs font-serif font-bold text-luxury-charcoal group-hover:text-luxury-gold-dark transition line-clamp-1 leading-snug">
              {product.name}
            </h4>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-1.5 pt-0.5 text-xs font-semibold">
            {activeSalePrice ? (
              <>
                <span className="text-luxury-gold-dark font-bold">Rs. {activeSalePrice}</span>
                <span className="text-[10px] text-zinc-400 line-through">Rs. {activePrice}</span>
              </>
            ) : (
              <span className="text-luxury-charcoal font-bold">Rs. {activePrice}</span>
            )}
          </div>
        </div>

        {/* Color Swatches */}
        {colorOpt && (
          <div className="flex gap-1.5 py-0.5 border-t border-zinc-50 pt-2.5">
            {(colorOpt.values ?? []).map((col) => {
              const isSelected = selectedColor === col;
              const colBg = 
                col.includes("Black") ? "bg-zinc-900" :
                col.includes("Dark Brown") ? "bg-amber-950" :
                col.includes("Chocolate") ? "bg-amber-900" :
                col.includes("Blonde") ? "bg-amber-200" : "bg-zinc-400";

              return (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  className={`w-4.5 h-4.5 rounded-full border ${colBg} transition relative flex items-center justify-center ${
                    isSelected ? "ring-1 ring-luxury-gold ring-offset-1 scale-105" : "border-black/5 hover:scale-105"
                  }`}
                  title={col}
                />
              );
            })}
          </div>
        )}

      </div>

    </motion.div>
  );
};
export default ProductCard;
