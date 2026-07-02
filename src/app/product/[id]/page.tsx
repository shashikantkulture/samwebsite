"use client";

import React, { useState, useEffect } from "react";
import { Star, Shield, RefreshCw, Calendar, Heart, ShoppingBag, Eye, HelpCircle, Truck, Info, Upload, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Components & Context
import AnnouncementBar from "../../../components/AnnouncementBar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import CartDrawer from "../../../components/CartDrawer";
import ProductCard from "../../../components/ProductCard";
import QuickViewModal from "../../../components/QuickViewModal";
import { useCart } from "../../../context/CartContext";
import { useApp } from "../../../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

// Data
import { CartItem } from "../../../types";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetail({ params }: ProductPageProps) {
  // Unwrap parameters using React.use (Next.js 15 pattern)
  const resolvedParams = React.use(params);
  const paramId = resolvedParams.id;

  const router = useRouter();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist, addToRecentlyViewed, recentlyViewed, products } = useApp();

  // Find product by slug or ID
  const product = products.find(
    (p) => p.slug === paramId || p.id === paramId
  );

  const isScrunchie = product ? (product.name.toLowerCase().includes("scrunch") || product.slug.toLowerCase().includes("scrunch")) : false;
  const isAccessory = product ? (product.category === "accessories") : false;

  // States
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedBase, setSelectedBase] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState("");
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  // Interactive Tab details
  const [activeTab, setActiveTab] = useState<"description" | "instructions" | "shipping" | "sizeChart">("description");

  // Zooming Feature State & Styles
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transform: "scale(1)",
    transformOrigin: "center center"
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transform: "scale(2.2)",
      transformOrigin: `${x}% ${y}%`,
      transition: "transform 0.1s ease-out"
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transform: "scale(1)",
      transformOrigin: "center center",
      transition: "transform 0.2s ease-out"
    });
  };

  // Delivery Estimator
  const [zipInput, setZipInput] = useState("");
  const [zipEstimator, setZipEstimator] = useState("");

  // Bundle selection (Frequently Bought Together)
  const [includeBundleComb, setIncludeBundleComb] = useState(true);

  useEffect(() => {
    if (product) {
      const safeOptions = Array.isArray(product.variantOptions) ? product.variantOptions : [];
      const colorOpt = safeOptions.find((o) => o.name === "Color");
      const lengthOpt = safeOptions.find((o) => o.name === "Length" || o.name === "Size" || o.name === "Title");
      const baseOpt = safeOptions.find((o) => o.name === "Base Type");

      setSelectedColor(colorOpt ? colorOpt.values[0] : "");
      setSelectedLength(lengthOpt ? lengthOpt.values[0] : "");
      setSelectedBase(baseOpt ? baseOpt.values[0] : "");
      setQty(1);
      setActiveImg(product.images?.[0] ?? "");
      addToRecentlyViewed(product.id);
    }
  }, [product, paramId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center text-center p-6">
        <h1 className="font-serif text-3xl font-bold mb-2">Product Not Found</h1>
        <p className="text-xs text-zinc-500 mb-6 uppercase tracking-wider">The luxury hair solution you requested is unavailable.</p>
        <Link href="/shop" className="px-6 py-3 bg-luxury-charcoal text-white text-xs uppercase font-bold tracking-widest rounded-lg">
          Browse Catalog
        </Link>
      </div>
    );
  }

  // Variant matching (safe)
  const safeVariants = Array.isArray(product.variants) ? product.variants : [];
  const matchedVariant = safeVariants.find((v) => {
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
    const sku = matchedVariant ? matchedVariant.sku : `PD-${product.id}`;

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

    // If bundle is checked, also add the matching premium scrunchies accessory (p19)
    if (includeBundleComb) {
      const accessory = products.find((p) => p.id === "p19");
      if (accessory) {
        const accItem: CartItem = {
          productId: accessory.id,
          productName: accessory.name,
          productSlug: accessory.slug,
          image: accessory.images[0],
          price: 169, // bundle discounted price
          salePrice: undefined,
          quantity: 1,
          selectedColor: "Default",
          selectedLength: "Default Title",
          sku: accessory.variants[0]?.sku || `ACC-${accessory.id}`
        };
        addToCart(accItem);
      }
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const sku = matchedVariant ? matchedVariant.sku : `PD-${product.id}`;

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

    // If bundle is checked, also add the matching premium scrunchies accessory (p19)
    if (includeBundleComb) {
      const accessory = products.find((p) => p.id === "p19");
      if (accessory) {
        const accItem: CartItem = {
          productId: accessory.id,
          productName: accessory.name,
          productSlug: accessory.slug,
          image: accessory.images[0],
          price: 169, // bundle discounted price
          salePrice: undefined,
          quantity: 1,
          selectedColor: "Default",
          selectedLength: "Default Title",
          sku: accessory.variants[0]?.sku || `ACC-${accessory.id}`
        };
        addToCart(accItem);
      }
    }

    router.push("/checkout");
  };

  const handleZipCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipInput.trim()) return;
    setZipEstimator("Calculating logistics...");
    setTimeout(() => {
      // Simulated delivery timelines
      const days = zipInput.startsWith("1") || zipInput.startsWith("2") ? "2-3 Days (Free Express)" : "3-5 Days (Standard)";
      setZipEstimator(`📅 Estimated Delivery: ${days}`);
    }, 800);
  };





  // Filter recently viewed items list
  const isCurrentScrunchie = product.name.toLowerCase().includes("scrunch");
  const recentProductsList = products.filter(
    (p) => recentlyViewed.includes(p.id) && p.id !== product.id && (isCurrentScrunchie || !p.name.toLowerCase().includes("scrunch"))
  ).slice(0, 3);

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="relative min-h-screen bg-white">
      <AnnouncementBar />
      <Header />
      <div className="h-[120px]" /> {/* Spacer */}

      {/* Main product editorial row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Panel: Photo Showcase */}
          <div className="lg:col-span-7 space-y-4">
            <div 
              className="relative aspect-w-3 aspect-h-4 overflow-hidden rounded-2xl bg-luxury-nude border border-zinc-100 flex items-center justify-center h-[400px] md:h-[550px] cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {activeImg ? (
                <img
                  src={activeImg}
                  alt={product.name}
                  className="w-full h-full max-h-[400px] md:max-h-[500px] transition-transform duration-100 ease-out object-contain"
                  style={zoomStyle}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300 text-sm">Loading...</div>
              )}

              {/* Zoom badge indicator */}
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1.5 rounded-lg border text-[9px] uppercase font-bold tracking-widest bg-white/85 backdrop-blur-xs text-luxury-charcoal border-zinc-150 shadow-xs inline-flex items-center gap-1 select-none">
                  🔍 Hover to Zoom
                </span>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            <div className="flex gap-3 overflow-x-auto pb-1.5 no-scrollbar">
              {(product.images ?? []).filter(Boolean).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(img)}
                  className={`w-16 h-20 border rounded-xl overflow-hidden flex-shrink-0 bg-white transition ${
                    activeImg === img ? "border-luxury-gold ring-1 ring-luxury-gold" : "border-zinc-200"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel: Spec sheets and CTA */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold tracking-widest text-luxury-gold-dark bg-luxury-champagne px-2.5 py-1 rounded">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-zinc-700 font-semibold">
                  <Star size={13} className="fill-luxury-gold text-luxury-gold" />
                  <span>{product.rating}</span>
                  <span className="text-zinc-400 font-normal">({product.reviewCount} verified reviews)</span>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-luxury-charcoal">
                {product.name}
              </h1>

              {/* Price row */}
              <div className="flex items-center gap-2 pt-1">
                {salePrice ? (
                  <>
                    <span className="text-2xl font-bold text-luxury-gold-dark">Rs. {salePrice}</span>
                    <span className="text-base text-zinc-400 line-through">Rs. {price}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded">
                      Promo Code Eligible
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-luxury-charcoal">Rs. {price}</span>
                )}
              </div>
            </div>

            <p className="text-xs text-zinc-555 leading-relaxed normal-case">
              {product.description}
            </p>

            {/* Variant choices */}
            <div className="space-y-4 border-t border-b border-zinc-100 py-6 text-xs font-medium space-y-4">
              {(() => {
                const safeOpts = Array.isArray(product.variantOptions) ? product.variantOptions : [];
                const colorOpt = safeOpts.find((o) => o.name === "Color");
                const lengthOpt = safeOpts.find((o) => o.name === "Length" || o.name === "Size" || o.name === "Title");
                const baseOpt = safeOpts.find((o) => o.name === "Base Type");
                return (
                  <>
                    {/* Color swatches */}
                    {colorOpt && (
                      <div>
                        <span className="text-zinc-400 uppercase tracking-widest block mb-2.5 text-[10px]">
                          Select Shade: <span className="text-luxury-charcoal font-bold">{selectedColor}</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(colorOpt.values ?? []).map((val) => {
                            const isSelected = selectedColor === val;
                            const colBg =
                              val.includes("Black") ? "bg-zinc-900" :
                              val.includes("Dark Brown") ? "bg-amber-950" :
                              val.includes("Chocolate") ? "bg-amber-900" :
                              val.includes("Blonde") ? "bg-amber-200" : "bg-zinc-400";
                            return (
                              <button
                                key={val}
                                onClick={() => setSelectedColor(val)}
                                className={`w-7.5 h-7.5 rounded-full ${colBg} relative flex items-center justify-center transition border ${
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

                    {/* Length Selector */}
                    {lengthOpt && lengthOpt.name !== "Title" && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-zinc-400 uppercase tracking-widest block text-[10px]">
                            Select {lengthOpt.name}: <span className="text-luxury-charcoal font-bold">{selectedLength}</span>
                          </span>
                          {!isAccessory && (
                            <button
                              onClick={() => setIsSizeChartOpen(true)}
                              className="text-luxury-gold-dark hover:text-luxury-gold text-[10px] uppercase font-bold tracking-wider underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                            >
                              📏 Size Guide
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {(lengthOpt.values ?? []).map((val) => (
                            <button
                              key={val}
                              onClick={() => setSelectedLength(val)}
                              className={`px-4 py-2 border rounded-xl text-[10px] tracking-widest transition uppercase ${
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

                    {/* Base Type Selector */}
                    {baseOpt && (
                      <div>
                        <span className="text-zinc-400 uppercase tracking-widest block mb-2 text-[10px]">
                          Select Scalp Base: <span className="text-luxury-charcoal font-bold">{selectedBase}</span>
                        </span>
                        <div className="flex gap-2">
                          {(baseOpt.values ?? []).map((val) => (
                            <button
                              key={val}
                              onClick={() => setSelectedBase(val)}
                              className={`px-4 py-2 border rounded-xl text-[10px] tracking-widest transition uppercase ${
                                selectedBase === val
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
                  </>
                );
              })()}
            </div>

            {/* ZIP estimator */}
            <div className="space-y-2 border-b border-zinc-100 pb-6 text-xs">
              <span className="text-zinc-400 uppercase tracking-widest block mb-1 text-[10px]">
                Estimated Delivery Checker
              </span>
              <form onSubmit={handleZipCheck} className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="ENTER ZIP CODE (e.g. 10001)"
                  required
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value)}
                  className="flex-1 border border-zinc-200 focus:border-luxury-gold px-3 py-2 text-xs rounded-lg focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-[10px] font-bold uppercase tracking-wider rounded-lg transition"
                >
                  Check
                </button>
              </form>
              {zipEstimator && (
                <p className="text-[10px] text-zinc-600 font-semibold flex items-center gap-1 pt-1">
                  <Truck size={12} className="text-luxury-gold-dark" /> {zipEstimator}
                </p>
              )}
            </div>

            {/* Frequently Bought Together Bundle */}
            {product.category !== "accessories" && (
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 space-y-4">
                <span className="text-[10px] uppercase font-black tracking-widest text-luxury-charcoal">
                  Frequently Bought Together
                </span>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-luxury-charcoal">
                  <div className="flex items-center gap-2">
                    <img src={product.images[0]} alt="" className="w-10 h-12 object-cover rounded bg-white border border-zinc-200" />
                    <span>This Item</span>
                  </div>
                  <span className="text-zinc-300 font-light text-base">+</span>
                  <div className="flex items-center gap-2">
                    <img src="https://www.sammrenaissance.com/cdn/shop/files/5_d0f6184b-9364-41f7-af7d-2386c70cb427.png?v=1745742797&width=330" alt="" className="w-10 h-12 object-cover rounded bg-white border border-zinc-200" />
                    <span className="text-zinc-655 normal-case font-normal">Seraphic Silk Scrunchies Set</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 text-xs">
                  <label className="flex items-center gap-2 text-zinc-655 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={includeBundleComb}
                      onChange={(e) => setIncludeBundleComb(e.target.checked)}
                      className="rounded border-zinc-300 text-luxury-gold focus:ring-luxury-gold w-4 h-4"
                    />
                    <span>Add Seraphic Silk Scrunchies Set (Save Rs. 50)</span>
                  </label>
                  <span className="font-bold text-luxury-gold-dark">+Rs. 169 <span className="line-through text-zinc-400 text-[10px]">Rs. 219</span></span>
                </div>
              </div>
            )}

            {/* Add to cart row */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest">
                <span className={`w-2 h-2 rounded-full ${
                  isOutOfStock ? "bg-red-500" : "bg-green-500 animate-pulse"
                }`} />
                <span className={isOutOfStock ? "text-red-500" : "text-green-600"}>
                  {isOutOfStock ? "Sold Out" : "In Stock - Express Shipping Dispatch within 24 Hrs"}
                </span>
              </div>

              <div className="flex gap-4">
                {/* Qty */}
                <div className="flex items-center border border-zinc-250 rounded-lg bg-zinc-50 px-1.5">
                  <button
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="p-2 text-zinc-500 hover:text-luxury-charcoal"
                    disabled={isOutOfStock}
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-luxury-charcoal">{qty}</span>
                  <button
                    onClick={() => setQty((prev) => prev + 1)}
                    className="p-2 text-zinc-500 hover:text-luxury-charcoal"
                    disabled={isOutOfStock}
                  >
                    +
                  </button>
                </div>

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

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 border rounded-lg transition ${
                    isWishlisted 
                      ? "border-red-500 text-red-500 bg-red-50/50" 
                      : "border-zinc-200 text-zinc-400 hover:text-luxury-charcoal hover:border-zinc-400"
                  }`}
                  aria-label="Wishlist toggle"
                >
                  <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                </button>
              </div>

              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 px-6 bg-[#0FB2AE] hover:bg-[#0c9693] text-white text-xs uppercase font-bold tracking-widest rounded-lg transition-all duration-300 shadow-md hover:shadow-lg btn-glassy-shine select-none"
                >
                  Buy It Now
                </button>
              )}
            </div>

            {/* Tab specs accordion */}
            <div className="border-t border-zinc-150 pt-6">
              <div className="flex gap-6 border-b border-zinc-100 pb-2 text-xs uppercase font-bold tracking-widest text-zinc-400 flex-wrap">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`pb-2 border-b-2 transition ${activeTab === "description" ? "border-luxury-charcoal text-luxury-charcoal font-black" : "border-transparent"}`}
                >
                  Product Details
                </button>
                {!isAccessory && (
                  <button
                    onClick={() => setActiveTab("sizeChart")}
                    className={`pb-2 border-b-2 transition ${activeTab === "sizeChart" ? "border-luxury-charcoal text-luxury-charcoal font-black" : "border-transparent"}`}
                  >
                    Size Guide
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("instructions")}
                  className={`pb-2 border-b-2 transition ${activeTab === "instructions" ? "border-luxury-charcoal text-luxury-charcoal font-black" : "border-transparent"}`}
                >
                  Care Rules
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-2 border-b-2 transition ${activeTab === "shipping" ? "border-luxury-charcoal text-luxury-charcoal font-black" : "border-transparent"}`}
                >
                  Delivery Guarantees
                </button>
              </div>

              <div className="pt-4 text-xs text-zinc-555 leading-relaxed normal-case">
                {activeTab === "description" && (
                  <ul className="list-disc pl-4 space-y-2">
                    {product.detailsList.map((li, idx) => (
                      <li key={idx}>{li}</li>
                    ))}
                  </ul>
                )}
                {!isAccessory && activeTab === "sizeChart" && (
                  <div className="overflow-x-auto rounded-xl border border-zinc-150 p-1 bg-white">
                    <table className="min-w-full divide-y divide-zinc-200 text-left text-xs text-luxury-charcoal">
                      <thead>
                        <tr className="bg-zinc-50 uppercase tracking-wider font-bold text-[9px] text-zinc-550">
                          <th className="px-4 py-2.5 border-b">Size</th>
                          <th className="px-4 py-2.5 border-b">Chest</th>
                          <th className="px-4 py-2.5 border-b">Waist</th>
                          <th className="px-4 py-2.5 border-b">Hip</th>
                          <th className="px-4 py-2.5 border-b">Full Length</th>
                          <th className="px-4 py-2.5 border-b">Bottom</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        <tr className="hover:bg-zinc-50/50">
                          <td className="px-4 py-2.5 font-bold border-b text-luxury-gold-dark">S</td>
                          <td className="px-4 py-2.5 border-b">32"</td>
                          <td className="px-4 py-2.5 border-b">30"</td>
                          <td className="px-4 py-2.5 border-b">34"</td>
                          <td className="px-4 py-2.5 border-b">57"</td>
                          <td className="px-4 py-2.5 border-b">20"</td>
                        </tr>
                        <tr className="hover:bg-zinc-50/50">
                          <td className="px-4 py-2.5 font-bold border-b text-luxury-gold-dark">M</td>
                          <td className="px-4 py-2.5 border-b">34"</td>
                          <td className="px-4 py-2.5 border-b">32"</td>
                          <td className="px-4 py-2.5 border-b">36"</td>
                          <td className="px-4 py-2.5 border-b">57"</td>
                          <td className="px-4 py-2.5 border-b">20"</td>
                        </tr>
                        <tr className="hover:bg-zinc-50/50">
                          <td className="px-4 py-2.5 font-bold border-b text-luxury-gold-dark">L</td>
                          <td className="px-4 py-2.5 border-b">36"</td>
                          <td className="px-4 py-2.5 border-b">34"</td>
                          <td className="px-4 py-2.5 border-b">38"</td>
                          <td className="px-4 py-2.5 border-b">57"</td>
                          <td className="px-4 py-2.5 border-b">20"</td>
                        </tr>
                        <tr className="hover:bg-zinc-50/50">
                          <td className="px-4 py-2.5 font-bold border-b text-luxury-gold-dark">XL</td>
                          <td className="px-4 py-2.5 border-b">38"</td>
                          <td className="px-4 py-2.5 border-b">36"</td>
                          <td className="px-4 py-2.5 border-b">40"</td>
                          <td className="px-4 py-2.5 border-b">57"</td>
                          <td className="px-4 py-2.5 border-b">20"</td>
                        </tr>
                        <tr className="hover:bg-zinc-50/50">
                          <td className="px-4 py-2.5 font-bold border-b text-luxury-gold-dark">XXL</td>
                          <td className="px-4 py-2.5 border-b">40"</td>
                          <td className="px-4 py-2.5 border-b">38"</td>
                          <td className="px-4 py-2.5 border-b">42"</td>
                          <td className="px-4 py-2.5 border-b">57"</td>
                          <td className="px-4 py-2.5 border-b">20"</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                {activeTab === "instructions" && (
                  <ul className="list-decimal pl-4 space-y-2">
                    {product.careInstructions.map((ins, idx) => (
                      <li key={idx}>{ins}</li>
                    ))}
                  </ul>
                )}
                {activeTab === "shipping" && (
                  <p>
                    📦 <strong>Free Express Shipping:</strong> Available on all orders over $150. Shipping logistics match tracking parameters instantly.<br />
                    ✈️ <strong>Worldwide Shipping:</strong> Dispatched from warehouses in Mumbai & California. Delivered within 3-7 business days globally.<br />
                    🔒 <strong>Returns:</strong> Hair extensions are eligible for hygiene return checks. The trial strand allows tone check color matching.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Recently Viewed Panel */}
      {recentProductsList.length > 0 && (
        <section className="bg-zinc-50 border-t border-b border-zinc-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-luxury-charcoal mb-8 text-center uppercase">
              Recently Viewed Products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {recentProductsList.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onQuickView={(id) => setQuickViewId(id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Global layouts */}
      <Footer />
      <CartDrawer />

      <AnimatePresence>
        {quickViewId && (
          <QuickViewModal
            productId={quickViewId}
            onClose={() => setQuickViewId(null)}
          />
        )}
        {isSizeChartOpen && (
          <SizeChartModal onClose={() => setIsSizeChartOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

interface SizeChartModalProps {
  onClose: () => void;
}

function SizeChartModal({ onClose }: SizeChartModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
      />
      
      {/* Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl z-10 border border-zinc-100 font-sans"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-luxury-charcoal transition p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h3 className="font-serif text-xl font-bold text-luxury-charcoal">Size Guide</h3>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Standard Measurements in Inches</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-150">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-xs text-luxury-charcoal">
            <thead>
              <tr className="bg-zinc-50 uppercase tracking-wider font-bold text-[9px] text-zinc-550">
                <th className="px-4 py-3 border-b text-center">Size</th>
                <th className="px-4 py-3 border-b">Chest</th>
                <th className="px-4 py-3 border-b">Waist</th>
                <th className="px-4 py-3 border-b">Hip</th>
                <th className="px-4 py-3 border-b">Full Length</th>
                <th className="px-4 py-3 border-b">Bottom</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              <tr className="hover:bg-zinc-50/30 transition">
                <td className="px-4 py-3 font-bold border-b text-luxury-gold-dark bg-zinc-50/30 text-center">S</td>
                <td className="px-4 py-3 border-b">32"</td>
                <td className="px-4 py-3 border-b">30"</td>
                <td className="px-4 py-3 border-b">34"</td>
                <td className="px-4 py-3 border-b">57"</td>
                <td className="px-4 py-3 border-b">20"</td>
              </tr>
              <tr className="hover:bg-zinc-50/30 transition">
                <td className="px-4 py-3 font-bold border-b text-luxury-gold-dark bg-zinc-50/30 text-center">M</td>
                <td className="px-4 py-3 border-b">34"</td>
                <td className="px-4 py-3 border-b">32"</td>
                <td className="px-4 py-3 border-b">36"</td>
                <td className="px-4 py-3 border-b">57"</td>
                <td className="px-4 py-3 border-b">20"</td>
              </tr>
              <tr className="hover:bg-zinc-50/30 transition">
                <td className="px-4 py-3 font-bold border-b text-luxury-gold-dark bg-zinc-50/30 text-center">L</td>
                <td className="px-4 py-3 border-b">36"</td>
                <td className="px-4 py-3 border-b">34"</td>
                <td className="px-4 py-3 border-b">38"</td>
                <td className="px-4 py-3 border-b">57"</td>
                <td className="px-4 py-3 border-b">20"</td>
              </tr>
              <tr className="hover:bg-zinc-50/30 transition">
                <td className="px-4 py-3 font-bold border-b text-luxury-gold-dark bg-zinc-50/30 text-center">XL</td>
                <td className="px-4 py-3 border-b">38"</td>
                <td className="px-4 py-3 border-b">36"</td>
                <td className="px-4 py-3 border-b">40"</td>
                <td className="px-4 py-3 border-b">57"</td>
                <td className="px-4 py-3 border-b">20"</td>
              </tr>
              <tr className="hover:bg-zinc-50/30 transition">
                <td className="px-4 py-3 font-bold border-b text-luxury-gold-dark bg-zinc-50/30 text-center">XXL</td>
                <td className="px-4 py-3 border-b">40"</td>
                <td className="px-4 py-3 border-b">38"</td>
                <td className="px-4 py-3 border-b">42"</td>
                <td className="px-4 py-3 border-b">57"</td>
                <td className="px-4 py-3 border-b">20"</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center gap-2 bg-luxury-champagne/45 p-3.5 rounded-xl border border-luxury-gold/15">
          <Info size={14} className="text-luxury-gold-dark flex-shrink-0" />
          <p className="text-[10px] text-zinc-550 leading-relaxed">
            Need custom fitting? Our design house offers bespoke tailored sizes. Please book a virtual consult or specify your exact measurements in the cart notes.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
