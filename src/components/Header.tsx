"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Heart, User, ShoppingBag, Menu, X, ChevronDown, Calendar } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, setIsCartOpen } = useCart();
  const { wishlist, searchQuery, setSearchQuery } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  // Tracks scroll behavior to add luxury sticky background blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch);
      setIsSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(localSearch)}`);
    }
  };

  const totalCartQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Styling helpers
  const isHome = pathname === "/";
  const headerBg = isScrolled 
    ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-zinc-100" 
    : isHome 
      ? "bg-transparent text-white" 
      : "bg-white border-b border-zinc-100";
      
  const textClass = isScrolled 
    ? "text-luxury-charcoal hover:text-luxury-gold" 
    : isHome 
      ? "text-white hover:text-luxury-champagne" 
      : "text-luxury-charcoal hover:text-luxury-gold";

  const iconClass = isScrolled 
    ? "text-luxury-charcoal hover:text-luxury-gold" 
    : isHome 
      ? "text-white hover:text-luxury-champagne" 
      : "text-luxury-charcoal hover:text-luxury-gold";

  return (
    <>
      <header className={`fixed top-10 left-0 right-0 z-40 transition-all duration-300 ${headerBg}`}>
        {/* Navigation Wrapper */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="https://www.sammrenaissance.com/cdn/shop/files/Samm_logo_png.png?v=1745690099&width=300" 
              alt="SAMM Renaissance" 
              className={`h-16 w-auto object-contain transition-all duration-300 ${isScrolled || !isHome ? "" : "brightness-0 invert"}`} 
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-6 2xl:space-x-10 font-semibold text-[12px] 2xl:text-[13px] uppercase tracking-widest">
            <Link href="/" className={`transition-colors ${textClass}`}>
              Home
            </Link>

            {/* Woman Dropdown */}
            <div className="relative group py-4">
              <span className={`flex items-center gap-1 cursor-pointer transition-colors ${textClass}`}>
                Woman <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-200" />
              </span>
              
              <div className="absolute top-full left-0 w-44 bg-white text-luxury-charcoal p-3 shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 border border-zinc-100 rounded-md z-50">
                <ul className="space-y-2 text-[11px] tracking-widest uppercase font-medium text-left">
                  <li><Link href="/shop?category=bodycon" className="hover:text-luxury-gold transition block">Bodycon</Link></li>
                  <li><Link href="/shop?category=bottomwear" className="hover:text-luxury-gold transition block">Bottom Wear</Link></li>
                  <li><Link href="/shop?category=coords" className="hover:text-luxury-gold transition block">Co-ords-set</Link></li>
                  <li><Link href="/shop?category=jumpsuits" className="hover:text-luxury-gold transition block">Jumpsuit</Link></li>
                  <li><Link href="/shop?category=mididress" className="hover:text-luxury-gold transition block">Midi-dress</Link></li>
                  <li><Link href="/shop?category=onepiece" className="hover:text-luxury-gold transition block">one-piece</Link></li>
                  <li><Link href="/shop?category=skirts" className="hover:text-luxury-gold transition block">skirts</Link></li>
                  <li><Link href="/shop?category=topwear" className="hover:text-luxury-gold transition block">topwear</Link></li>
                </ul>
              </div>
            </div>

            {/* Kiki's Product Dropdown */}
            <div className="relative group py-4">
              <span className={`flex items-center gap-1 cursor-pointer transition-colors ${textClass}`}>
                Kiki's Product <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-200" />
              </span>
              
              <div className="absolute top-full left-0 w-44 bg-white text-luxury-charcoal p-3 shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 border border-zinc-100 rounded-md z-50">
                <ul className="space-y-2 text-[11px] tracking-widest uppercase font-medium text-left">
                  <li><Link href="/shop?category=accessories" className="hover:text-luxury-gold transition block">Scrunchies</Link></li>
                  <li><Link href="/shop?category=accessories" className="hover:text-luxury-gold transition block">Hair Bows</Link></li>
                  <li><Link href="/kikis-hair" className="hover:text-luxury-gold transition block">All Kikis Hair</Link></li>
                </ul>
              </div>
            </div>

            <Link href="/shop?category=gowns" className={`transition-colors ${textClass}`}>
              Kids Wear
            </Link>

            <Link href="/#contact" className={`transition-colors ${textClass}`}>
              About
            </Link>
          </nav>

          {/* Header Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5 md:space-x-6">
            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`p-1.5 transition-colors ${iconClass}`}
              aria-label="Open Search"
            >
              <Search size={21} />
            </button>

            {/* Wishlist */}
            <Link
              href="/account?tab=wishlist"
              className={`p-1.5 transition-colors relative ${iconClass}`}
              aria-label="Wishlist"
            >
              <Heart size={21} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-luxury-gold text-white text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Account Dashboard */}
            <Link
              href="/account"
              className={`p-1.5 transition-colors ${iconClass}`}
              aria-label="Account Dashboard"
            >
              <User size={21} />
            </Link>

            {/* Shopping Bag Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`p-1.5 transition-colors relative ${iconClass}`}
              aria-label="Open Cart"
            >
              <ShoppingBag size={21} />
              {totalCartQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-luxury-charcoal text-luxury-nude text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white animate-pulse">
                  {totalCartQty}
                </span>
              )}
            </button>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`xl:hidden p-1.5 transition-colors ${iconClass}`}
              aria-label="Toggle Menu"
            >
              <Menu size={23} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden xl:hidden">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Drawer side panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute inset-y-0 right-0 max-w-xs w-full bg-white text-luxury-charcoal shadow-2xl flex flex-col p-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <span className="font-serif font-bold tracking-widest text-sm">SAMM MENU</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-500 hover:text-luxury-charcoal">
                  <X size={22} />
                </button>
              </div>
              
              <nav className="flex-1 flex flex-col space-y-5 text-sm uppercase tracking-widest font-semibold pt-6 overflow-y-auto no-scrollbar">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-luxury-gold transition">
                  Home
                </Link>
                
                {/* Woman section */}
                <div className="space-y-2 border-t border-zinc-100 pt-3">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Woman</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pl-2">
                    <Link href="/shop?category=bodycon" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-zinc-600 hover:text-luxury-gold normal-case">Bodycon</Link>
                    <Link href="/shop?category=bottomwear" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-zinc-600 hover:text-luxury-gold normal-case">Bottom Wear</Link>
                    <Link href="/shop?category=coords" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-zinc-600 hover:text-luxury-gold normal-case">Co-ords-set</Link>
                    <Link href="/shop?category=jumpsuits" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-zinc-600 hover:text-luxury-gold normal-case">Jumpsuit</Link>
                    <Link href="/shop?category=mididress" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-zinc-600 hover:text-luxury-gold normal-case">Midi-dress</Link>
                    <Link href="/shop?category=onepiece" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-zinc-600 hover:text-luxury-gold normal-case">one-piece</Link>
                    <Link href="/shop?category=skirts" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-zinc-600 hover:text-luxury-gold normal-case">skirts</Link>
                    <Link href="/shop?category=topwear" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-zinc-600 hover:text-luxury-gold normal-case">topwear</Link>
                  </div>
                </div>

                {/* Kiki's Product section */}
                <div className="space-y-2 border-t border-zinc-100 pt-3">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Kiki's Product</p>
                  <div className="flex flex-col gap-2.5 pl-2">
                    <Link href="/shop?category=accessories" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-zinc-600 hover:text-luxury-gold normal-case">Scrunchies</Link>
                    <Link href="/shop?category=accessories" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-zinc-600 hover:text-luxury-gold normal-case">Hair Bows</Link>
                    <Link href="/kikis-hair" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-zinc-600 hover:text-luxury-gold normal-case font-bold text-luxury-gold-dark">All Kikis Hair</Link>
                  </div>
                </div>

                <Link href="/shop?category=gowns" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-luxury-gold transition border-t border-zinc-100 pt-3">
                  Kids Wear
                </Link>

                <Link href="/#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-luxury-gold transition border-t border-zinc-100 pt-3">
                  About
                </Link>
              </nav>
              
              <div className="border-t border-zinc-100 pt-4 text-center">
                <p className="text-xs text-zinc-500 italic">Luxury Apparel & Hair Accessories</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Fullscreen Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-luxury-charcoal transition-colors p-2"
              aria-label="Close search"
            >
              <X size={26} />
            </button>
            
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="max-w-2xl w-full text-center"
            >
              <h3 className="font-serif text-2xl font-medium text-luxury-charcoal mb-8 tracking-wide">
                What hair solution are you searching for?
              </h3>
              <form onSubmit={handleSearchSubmit} className="relative border-b-2 border-luxury-charcoal pb-3 flex items-center">
                <input
                  type="text"
                  placeholder="Search extensions, toppers, wigs, volume..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full text-xl md:text-3xl font-light text-luxury-charcoal bg-transparent placeholder-zinc-300 focus:outline-none"
                  autoFocus
                />
                <button type="submit" className="text-luxury-charcoal hover:text-luxury-gold transition-colors p-1" aria-label="Submit search">
                  <Search size={28} />
                </button>
              </form>
              <div className="flex flex-wrap gap-2 justify-center mt-6 text-xs text-zinc-500 font-medium">
                <span className="uppercase tracking-widest mr-2">Suggestions:</span>
                <button type="button" onClick={() => { setLocalSearch("Toppers"); }} className="underline hover:text-luxury-gold bg-transparent border-0 cursor-pointer">Toppers</button>
                <span>•</span>
                <button type="button" onClick={() => { setLocalSearch("Clip-In"); }} className="underline hover:text-luxury-gold bg-transparent border-0 cursor-pointer">Clip-Ins</button>
                <span>•</span>
                <button type="button" onClick={() => { setLocalSearch("Bangs"); }} className="underline hover:text-luxury-gold bg-transparent border-0 cursor-pointer">Bangs</button>
                <span>•</span>
                <button type="button" onClick={() => { setLocalSearch("Volume"); }} className="underline hover:text-luxury-gold bg-transparent border-0 cursor-pointer">Volume</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Header;
