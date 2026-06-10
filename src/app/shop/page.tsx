"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, ArrowUpDown, X, Star, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import AnnouncementBar from "../../components/AnnouncementBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import QuickViewModal from "../../components/QuickViewModal";
import CartDrawer from "../../components/CartDrawer";

import { useApp } from "../../context/AppContext";

function ShopContent() {
  const searchParams = useSearchParams();
  const { products } = useApp();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSolution, setSelectedSolution] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [sortBy, setSortBy] = useState("bestseller");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state with URL params on load
  useEffect(() => {
    const cat = searchParams.get("category");
    const sol = searchParams.get("solution");
    const q = searchParams.get("search");

    if (cat) setSelectedCategory(cat);
    if (sol) setSelectedSolution(sol);
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Available Categories lists
  const CATEGORIES = [
    { value: "all", label: "All Categories" },
    { value: "bodycon", label: "Bodycon" },
    { value: "bottomwear", label: "Bottom Wear" },
    { value: "coords", label: "Co-ords-set" },
    { value: "jumpsuits", label: "Jumpsuit" },
    { value: "mididress", label: "Midi-dress" },
    { value: "onepiece", label: "One-piece" },
    { value: "skirts", label: "Skirts" },
    { value: "topwear", label: "Topwear" },
    { value: "accessories", label: "Accessories" },
    { value: "gowns", label: "Kids Wear" }
  ];

  const SOLUTIONS = [
    { value: "all", label: "All Styles" },
    { value: "partywear", label: "Party Wear" },
    { value: "casual", label: "Casual Luxury" },
    { value: "kids", label: "Kids Collections" },
    { value: "festive", label: "Festive Wear" },
    { value: "styling", label: "Designer Accents" }
  ];

  const COLORS = ["all", "maroon", "blue", "Green", "golden", "cream", "Red", "off-white", "Black"];

  // Filter & Sort Logic
  const getFilteredProducts = () => {
    let list = [...products];

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Solution filter
    if (selectedSolution !== "all") {
      list = list.filter((p) => (p.solutions ?? []).includes(selectedSolution));
    }

    // Color match filter
    if (selectedColor !== "all") {
      list = list.filter((p) =>
        (p.variantOptions ?? []).some(
          (o) => o.name === "Color" && (o.values ?? []).includes(selectedColor)
        )
      );
    }

    // Sorting
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

  const filteredProducts = getFilteredProducts();

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedSolution("all");
    setSelectedColor("all");
    setSortBy("bestseller");
    setSearchQuery("");
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Sticky Header */}
      <Header />

      {/* Spacing Offset */}
      <div className="h-[120px]" />

      {/* Catalog Title Banner */}
      <div className="bg-luxury-nude py-12 border-b border-luxury-nude-dark text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <span className="text-[9px] uppercase tracking-widest font-black text-luxury-gold-dark">
            Luxury Designer Wear & Accessories
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-luxury-charcoal">
            The SAMM Renaissance Catalog
          </h1>
          {searchQuery && (
            <p className="text-xs text-zinc-500 font-medium pt-1">
              Search Results for: <strong className="text-luxury-charcoal">"{searchQuery}"</strong>
            </p>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 font-sans text-xs">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <SlidersHorizontal size={14} className="text-luxury-charcoal" />
              <span className="text-xs font-bold uppercase tracking-wider text-luxury-charcoal">
                Filters & Toggles
              </span>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                Product Categories
              </h4>
              <div className="flex flex-col gap-2 font-medium text-zinc-650">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setSelectedCategory(c.value)}
                    className={`text-left hover:text-luxury-gold transition-colors ${
                      selectedCategory === c.value ? "text-luxury-gold-dark font-bold" : ""
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Solution Filter */}
            <div className="space-y-3 border-t border-zinc-105 pt-6">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                Shop By Style
              </h4>
              <div className="flex flex-col gap-2 font-medium text-zinc-650">
                {SOLUTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedSolution(s.value)}
                    className={`text-left hover:text-luxury-gold transition-colors ${
                      selectedSolution === s.value ? "text-luxury-gold-dark font-bold" : ""
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-3 border-t border-zinc-105 pt-6">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                Color Shade Swatch
              </h4>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((col) => {
                  const isSelected = selectedColor === col;
                  const colBg = 
                    col === "all" ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-300" :
                    col.toLowerCase() === "black" ? "bg-zinc-900" :
                    col.toLowerCase() === "maroon" ? "bg-red-850" :
                    col.toLowerCase() === "red" ? "bg-red-600" :
                    col.toLowerCase() === "blue" ? "bg-blue-600" :
                    col.toLowerCase() === "green" ? "bg-emerald-700" :
                    col.toLowerCase() === "golden" ? "bg-yellow-500" :
                    col.toLowerCase() === "cream" ? "bg-amber-50" :
                    col.toLowerCase() === "off-white" ? "bg-zinc-100" : "bg-zinc-400";

                  return (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 border rounded-lg text-[9px] uppercase font-bold tracking-wider transition ${
                        isSelected 
                          ? "border-luxury-charcoal bg-luxury-charcoal text-white" 
                          : "border-zinc-200 hover:border-zinc-400 text-zinc-650 bg-white"
                      }`}
                    >
                      {col === "all" ? "All Shades" : col.split(" ")[1] || col}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={handleResetFilters}
              className="w-full py-2.5 border border-dashed border-zinc-300 hover:border-luxury-charcoal text-zinc-500 hover:text-luxury-charcoal text-[10px] uppercase font-bold tracking-wider rounded-lg transition"
            >
              Reset Filters
            </button>
          </aside>

          {/* Right Product Grid */}
          <main className="lg:col-span-9 space-y-8">
            
            {/* Sort & Stats Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-100 pb-5">
              <p className="text-xs text-zinc-400 font-medium">
                Showing <strong className="text-luxury-charcoal">{filteredProducts.length}</strong> luxurious hair options
              </p>

              <div className="flex items-center gap-4 text-xs">
                {/* Mobile Filter toggle */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-zinc-200 rounded-lg hover:border-luxury-charcoal text-zinc-650 hover:text-luxury-charcoal transition"
                >
                  <SlidersHorizontal size={14} /> Filter
                </button>

                {/* Sort selector */}
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <ArrowUpDown size={13} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-650 focus:outline-none focus:border-luxury-gold uppercase text-[10px] tracking-wider"
                  >
                    <option value="bestseller">Sort: Featured</option>
                    <option value="rating">Sort: Top Rated</option>
                    <option value="price_asc">Sort: Price: Low to High</option>
                    <option value="price_desc">Sort: Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4 max-w-lg mx-auto">
                <SlidersHorizontal size={36} className="text-zinc-200 stroke-[1.5] mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-luxury-charcoal uppercase">No matches found</h3>
                  <p className="text-xs text-zinc-500 normal-case leading-relaxed">
                    Try broadening your selection filters or search terms. Our stylists are also available live to shade match.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-[10px] font-bold uppercase tracking-widest rounded-lg transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(id) => setQuickViewId(id)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer filter */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden font-sans">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
              <span className="font-bold text-xs uppercase tracking-wider text-luxury-charcoal">Filters</span>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-zinc-400 hover:text-luxury-charcoal">
                <X size={20} />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-4 mb-8">
              <h4 className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Categories</h4>
              <div className="flex flex-col gap-3 text-xs font-semibold text-zinc-650">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => { setSelectedCategory(c.value); setIsMobileFilterOpen(false); }}
                    className={`text-left ${selectedCategory === c.value ? "text-luxury-gold-dark font-black" : ""}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Concerns */}
            <div className="space-y-4 mb-8">
              <h4 className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Styles</h4>
              <div className="flex flex-col gap-3 text-xs font-semibold text-zinc-650">
                {SOLUTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => { setSelectedSolution(s.value); setIsMobileFilterOpen(false); }}
                    className={`text-left ${selectedSolution === s.value ? "text-luxury-gold-dark font-black" : ""}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { handleResetFilters(); setIsMobileFilterOpen(false); }}
              className="w-full py-3 bg-zinc-100 hover:bg-luxury-charcoal text-zinc-600 hover:text-white text-xs uppercase font-bold tracking-widest rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Global Drawers */}
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

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans text-xs uppercase tracking-widest text-zinc-400">
        <RefreshCw className="animate-spin text-luxury-gold mb-2" size={24} />
        Loading SAMM Renaissance Catalog...
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
