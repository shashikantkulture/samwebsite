"use client";

import React, { useState, Suspense } from "react";
import { RefreshCw, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import AnnouncementBar from "../../components/AnnouncementBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import QuickViewModal from "../../components/QuickViewModal";
import CartDrawer from "../../components/CartDrawer";

import { useApp } from "../../context/AppContext";

function KikisHairContent() {
  const { products } = useApp();
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("featured");

  // Filter only scrunchie products
  const getScrunchies = () => {
    let list = products.filter(
      (p) => p.name.toLowerCase().includes("scrunch") || p.slug.toLowerCase().includes("scrunch")
    );

    if (sortBy === "price_asc") {
      list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: bestsellers first
      list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return list;
  };

  const scrunchies = getScrunchies();

  return (
    <div className="relative min-h-screen bg-white font-sans">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Sticky Header */}
      <Header />

      {/* Spacing Offset */}
      <div className="h-[120px]" />

      {/* Hero Banner */}
      <div className="relative bg-zinc-950 text-white py-24 overflow-hidden select-none border-b border-zinc-900">
        <div className="absolute inset-0">
          <img
            src="https://www.sammrenaissance.com/cdn/shop/files/5_d0f6184b-9364-41f7-af7d-2386c70cb427.png?v=1745742797&width=1400"
            alt="Kikis Hair Silk Scrunchies Campaign"
            className="w-full h-full object-cover opacity-35 filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-4">
          <span className="text-[9px] uppercase tracking-[0.2em] font-black text-luxury-gold bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Exclusive Collection
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wide uppercase">
            Kikis Hair
          </h1>
          <p className="text-xs sm:text-sm max-w-xl mx-auto font-light text-zinc-300 leading-relaxed normal-case">
            Exquisite, friction-free premium satin scrunchies designed to deliver gentle hold and prevent hair breakage. Elevate your everyday styling with timeless runway-ready elegance.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Sort & Stats Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-100 pb-5 mb-10 text-xs">
          <p className="text-zinc-400 font-medium">
            Showing <strong className="text-luxury-charcoal">{scrunchies.length}</strong> luxurious silk options
          </p>

          <div className="flex items-center gap-1.5 text-zinc-500">
            <ArrowUpDown size={13} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-655 focus:outline-none focus:border-luxury-gold uppercase text-[10px] tracking-wider"
            >
              <option value="featured">Sort: Featured</option>
              <option value="rating">Sort: Top Rated</option>
              <option value="price_asc">Sort: Price: Low to High</option>
              <option value="price_desc">Sort: Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {scrunchies.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(id) => setQuickViewId(id)}
            />
          ))}
        </div>
      </div>

      {/* Footer & Drawer */}
      <Footer />
      <CartDrawer />

      <AnimatePresence>
        {quickViewId && (
          <QuickViewModal
            productId={quickViewId}
            onClose={() => setQuickViewId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function KikisHair() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans text-xs uppercase tracking-widest text-zinc-400">
        <RefreshCw className="animate-spin text-luxury-gold mb-2" size={24} />
        Loading Kikis Hair Collection...
      </div>
    }>
      <KikisHairContent />
    </Suspense>
  );
}
