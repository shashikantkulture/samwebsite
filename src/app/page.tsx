"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, Heart, Shield, RefreshCw, Star, CheckCircle, ChevronDown, Check, ArrowRight, Play, Eye } from "lucide-react";

// Components
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import ShopTheLook from "../components/ShopTheLook";
import VirtualTryOn from "../components/VirtualTryOn";

import { useApp } from "../context/AppContext";
import { useCart } from "../context/CartContext";

export default function Home() {
  const { reviews, addReview, incrementReviewHelpful, products, homepageSettings } = useApp();
  const { isCartOpen } = useCart();

  const defaultSettings = {
    heroImage: "https://www.sammrenaissance.com/cdn/shop/files/PRELIMENARY_-_43.png?v=1770894391",
    heroTitle: "Unveil Your Elegance.\nExquisite Custom Wear.",
    heroSubtitle: "Exquisite corset jumpsuits, kids fairy-style gowns, co-ords, and luxury accessories designed to make every occasion a fairytale.",
    categoryJumpsuitsImage: "https://cdn.shopify.com/s/files/1/0932/4796/3414/files/PRELIMENARY-34.png?v=1771478209",
    categoryGownsImage: "https://cdn.shopify.com/s/files/1/0932/4796/3414/files/Untitleddesign_2.png?v=1771474477",
    categoryAccessoriesImage: "https://www.sammrenaissance.com/cdn/shop/files/5_d0f6184b-9364-41f7-af7d-2386c70cb427.png?v=1745742797",
    influencer1Image: "https://images.unsplash.com/photo-1595959183079-c1b0a865578a?w=600&auto=format&fit=crop",
    influencer1Name: "Celebrity Feature: Sanya Sen",
    influencer1Text: "We styled Sanya for the Filmfare Red Carpet using our Corset Jumpsuit. The structured bodice matches natural contours flawlessly.",
    influencer2Image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop",
    influencer2Name: "Stylist Masterclass: Mira Kapoor",
    influencer2Text: "Our co-ord sets are Sanya's go-to for smart travel luxury. Very comfortable yet tailored.",
  };

  const settings = { ...defaultSettings, ...(homepageSettings ?? {}) };

  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [selectedSolutionTab, setSelectedSolutionTab] = useState("volume");
  
  // Review submission state
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    title: "",
    text: "",
    productName: "Classic 7-Set Clip-In Hair Extensions"
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Active FAQ Accordion state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Handle Review submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.title || !reviewForm.text) return;
    
    addReview({
      productId: reviewForm.productName.includes("Topper") ? "p2" : "p1",
      productName: reviewForm.productName,
      userName: reviewForm.name,
      rating: reviewForm.rating,
      title: reviewForm.title,
      text: reviewForm.text,
      verified: true
    });

    setReviewSubmitted(true);
    setReviewForm({
      name: "",
      rating: 5,
      title: "",
      text: "",
      productName: "Classic 7-Set Clip-In Hair Extensions"
    });
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const newLaunches = products.filter((p) => p.isNew && !p.name.toLowerCase().includes("scrunch")).slice(0, 3);
  const bestsellers = products.filter((p) => p.isBestseller && !p.name.toLowerCase().includes("scrunch")).slice(0, 4);

  const FAQS = [
    {
      q: "Does SAMM Renaissance provide custom sizing?",
      a: "Yes! Many of our pieces (such as the Kids Fairy Gowns and Women's Jumpsuits) can be tailored to your specific measurements. Feel free to contact our customer support team to discuss custom sizing options."
    },
    {
      q: "How do I choose the correct size for kids dresses?",
      a: "Our kids collection is designed with age-appropriate sizing (e.g., 1-3Y, 3-5Y). Each product page features a detailed size chart. If your child is between sizes, we recommend sizing up or contacting us for custom sizing."
    },
    {
      q: "What fabrics do you use for kids wear?",
      a: "We prioritize comfort without losing any princess-like volume. All kids gowns feature soft organza and net layers on the outside, and are lined with 100% breathable satin or cotton to prevent skin irritation."
    },
    {
      q: "Can I return or exchange apparel items?",
      a: "Yes, we offer standard returns and size exchanges on unworn, unwashed apparel items with tags intact within 14 days of delivery. Custom-sized creations are made to order and are final sale."
    }
  ];

  return (
    <div className="relative min-h-screen bg-white">
      
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Premium Navigation Header */}
      <Header />

      {/* 3. Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-zinc-950 text-white">
        {/* Background Image / Video Fallback */}
        <div className="absolute inset-0">
          <img
            src={settings.heroImage}
            alt="Premium designer wear campaign"
            className="w-full h-full object-cover opacity-60 filter brightness-90 transform scale-105"
          />
          {/* Subtle Parallax gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/30" />
        </div>

        {/* Content Box */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative z-10 max-w-4xl mx-auto text-center px-6 space-y-6 md:space-y-8 select-none"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] sm:text-xs uppercase font-bold tracking-widest text-luxury-champagne border border-white/20 animate-pulse">
            <Sparkles size={13} className="text-luxury-gold" /> Premium Designer Gowns, Apparel & Styling
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wide leading-tight text-white drop-shadow-md">
            {settings.heroTitle.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < settings.heroTitle.split("\n").length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
          <p className="text-sm sm:text-lg max-w-xl mx-auto font-light text-zinc-200 tracking-wide leading-relaxed normal-case">
            {settings.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-luxury-gold text-luxury-charcoal hover:text-luxury-charcoal text-xs uppercase font-bold tracking-widest transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.03]"
            >
              Shop Collection
            </Link>
          </div>

          {/* Trust badges row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-3xl mx-auto border-t border-white/10 text-white/80">
            <div className="flex flex-col items-center gap-1.5 text-center text-[10px] sm:text-xs uppercase tracking-widest">
              <Shield size={16} className="text-luxury-gold" />
              <span>Premium Fabrics & Fit</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center text-[10px] sm:text-xs uppercase tracking-widest">
              <CheckCircle size={16} className="text-luxury-gold" />
              <span>Handcrafted Detailing</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center text-[10px] sm:text-xs uppercase tracking-widest">
              <RefreshCw size={16} className="text-luxury-gold" />
              <span>Custom Sizing & Fittings</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center text-[10px] sm:text-xs uppercase tracking-widest">
              <Star size={16} className="text-luxury-gold fill-luxury-gold" />
              <span>4.9/5 Star Verified Reviews</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Celebrity & Media Recognition "As Seen On" */}
      <section className="bg-luxury-nude py-12 border-b border-luxury-nude-dark overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-6">
            Recognized & Featured In
          </p>
          <div className="relative w-full overflow-hidden">
            <div className="animate-marquee flex items-center space-x-12 sm:space-x-20 text-lg sm:text-2xl font-serif font-black tracking-widest text-zinc-450 uppercase whitespace-nowrap">
              <span>VOGUE</span>
              <span>ELLE</span>
              <span>COSMOPOLITAN</span>
              <span>HARPER'S BAZAAR</span>
              <span>FILMFARE</span>
              <span>LIFESTYLE MEDIA</span>
              <span>GLAMOUR</span>
              {/* Duplicate for infinite marquee wrap */}
              <span>VOGUE</span>
              <span>ELLE</span>
              <span>COSMOPOLITAN</span>
              <span>HARPER'S BAZAAR</span>
              <span>FILMFARE</span>
              <span>LIFESTYLE MEDIA</span>
              <span>GLAMOUR</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Launch Collection */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-zinc-100 pb-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold-dark bg-luxury-champagne px-2.5 py-1 rounded">
              LATEST CAMPAIGN
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-luxury-charcoal tracking-wide pt-1">
              New Launch Highlights
            </h2>
          </div>
          <Link
            href="/shop?sort=new"
            className="text-xs uppercase font-bold tracking-widest text-luxury-gold-dark hover:text-luxury-charcoal transition flex items-center gap-1"
          >
            Explore All New Releases <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {newLaunches.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onQuickView={(id) => setQuickViewId(id)}
            />
          ))}
        </div>
      </motion.section>

      {/* 6. Shop By Category */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 bg-zinc-50 border-t border-b border-zinc-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-16">
            <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 block">
              Curated Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-luxury-charcoal tracking-wide">
              Shop By Category
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category 1 */}
            <Link
              href="/shop?category=jumpsuits"
              className="group relative h-96 rounded-2xl overflow-hidden shadow-xs border border-zinc-100 block cursor-pointer"
            >
              <img
                src={settings.categoryJumpsuitsImage}
                alt="Jumpsuits & Co-ords catalog"
                className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
              <div className="absolute left-6 bottom-6 text-white space-y-1">
                <h3 className="font-serif text-lg font-bold uppercase tracking-wider">Jumpsuits & Co-ords</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-champagne hover:underline inline-flex items-center gap-1">
                  Shop Designer Apparel &rarr;
                </span>
              </div>
            </Link>

            {/* Category 2 */}
            <Link
              href="/shop?category=gowns"
              className="group relative h-96 rounded-2xl overflow-hidden shadow-xs border border-zinc-100 block cursor-pointer"
            >
              <img
                src={settings.categoryGownsImage}
                alt="Kids fairy gowns catalog"
                className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
              <div className="absolute left-6 bottom-6 text-white space-y-1">
                <h3 className="font-serif text-lg font-bold uppercase tracking-wider">Kids Gowns & Tulle</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-champagne hover:underline inline-flex items-center gap-1">
                  Shop Gowns &rarr;
                </span>
              </div>
            </Link>

            {/* Category 3 */}
            <Link
              href="/shop?category=accessories"
              className="group relative h-96 rounded-2xl overflow-hidden shadow-xs border border-zinc-100 block cursor-pointer"
            >
              <img
                src={settings.categoryAccessoriesImage}
                alt="Bows & Scrunchies Accessories"
                className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
              <div className="absolute left-6 bottom-6 text-white space-y-1">
                <h3 className="font-serif text-lg font-bold uppercase tracking-wider">Luxury Accessories</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-champagne hover:underline inline-flex items-center gap-1">
                  Shop Scrunchies & Bows &rarr;
                </span>
              </div>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 7. Shop By Solution */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center space-y-2 mb-12">
          <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 block">
            Targeted Hair Matches
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-luxury-charcoal tracking-wide">
            Shop By Solution
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-3 overflow-x-auto pb-4 no-scrollbar max-w-2xl mx-auto mb-10 border-b border-zinc-100">
          {[
            { id: "partywear", label: "Party Wear" },
            { id: "casual", label: "Casual Luxury" },
            { id: "kids", label: "Kids Collections" },
            { id: "festive", label: "Festive Wear" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSolutionTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                selectedSolutionTab === tab.id
                  ? "bg-luxury-charcoal text-white shadow-xs"
                  : "bg-luxury-nude text-zinc-655 hover:bg-luxury-nude-dark border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Solution Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.filter((p) => (p.solutions ?? []).includes(selectedSolutionTab) && !p.name.toLowerCase().includes("scrunch"))
            .slice(0, 3)
            .map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={(id) => setQuickViewId(id)}
              />
            ))}
        </div>
      </motion.section>



      {/* 9. Hair Transformations Gallery (Before vs After) */}
      <motion.section
        id="transformations"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <span className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold-dark bg-luxury-champagne px-2.5 py-1 rounded inline-block">
              Proven Results
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-charcoal tracking-wide">
              Real Wear.<br />Real Transformations.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 normal-case leading-relaxed">
              Drag the interactive slider to view the seamless styling power of our designer jumpsuits and kids gowns. See how they elevate plain appearances to runway-level styles instantly.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4 max-w-md mx-auto lg:mx-0 border-t border-zinc-150 text-center">
              <div>
                <p className="text-lg sm:text-xl font-serif font-black text-luxury-gold-dark">10k+</p>
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Fittings Completed</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-serif font-black text-luxury-gold-dark">4.9 ★</p>
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Satisfied Rating</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-serif font-black text-luxury-gold-dark">100%</p>
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Custom Tailored</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex justify-center">
            <BeforeAfterSlider />
          </div>

        </div>
      </motion.section>

      {/* 10. Shop The Look Section (Hotspots) */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 bg-zinc-50 border-t border-b border-zinc-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-16">
            <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 block">
              Editorial Lookbook
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-luxury-charcoal tracking-wide">
              Shop The Campaign Looks
            </h2>
          </div>
          <div className="flex justify-center">
            <ShopTheLook />
          </div>
        </div>
      </motion.section>

      {/* 11. Bestsellers Section (Infinite Carousel) */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center space-y-2 mb-16">
          <span className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold-dark bg-luxury-champagne px-2.5 py-1 rounded inline-block">
            Our Top Sellers
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-luxury-charcoal tracking-wide">
            The SAMM Renaissance Bestsellers
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestsellers.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onQuickView={(id) => setQuickViewId(id)}
            />
          ))}
        </div>
      </motion.section>

      {/* 12. Video Testimonials (Vertical Portrait TikTok-style grids) */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 bg-zinc-50 border-t border-b border-zinc-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-16">
            <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 block">
              Customer Love Stories
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-luxury-charcoal tracking-wide">
              Real Reviews, Live Blending
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Video Card 1 */}
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-zinc-100 bg-black h-[480px] sm:h-[540px]">
              <video
                src="/blue dress video.mp4"
                className="w-full h-full object-cover"
                controls
                loop
                muted
                playsInline
                autoPlay
              />
            </div>

            {/* Video Card 2 */}
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-zinc-100 bg-black h-[480px] sm:h-[540px]">
              <video
                src="/white dress video.mp4"
                className="w-full h-full object-cover"
                controls
                loop
                muted
                playsInline
                autoPlay
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 13. Celebrity Endorsements */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center space-y-2 mb-16">
          <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 block">
            Approved by Stylists & Celebs
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-luxury-charcoal tracking-wide">
            Loved by Influencers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1 */}
          <div className="relative group rounded-3xl overflow-hidden aspect-w-4 aspect-h-3 h-[300px] sm:h-[350px] shadow-sm border border-zinc-100 bg-zinc-900">
            <img
              src={settings.influencer1Image}
              alt="Model hair lookbook style"
              className="w-full h-full object-cover opacity-70 transition-transform duration-750 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal via-luxury-charcoal/10" />
            <div className="absolute left-6 bottom-6 right-6 text-white space-y-1.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-luxury-champagne bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded">
                {settings.influencer1Name}
              </span>
              <p className="text-xs text-zinc-300 normal-case leading-relaxed font-light italic">
                {settings.influencer1Text}
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative group rounded-3xl overflow-hidden aspect-w-4 aspect-h-3 h-[300px] sm:h-[350px] shadow-sm border border-zinc-100 bg-zinc-900">
            <img
              src={settings.influencer2Image}
              alt="Stylist endorsement view"
              className="w-full h-full object-cover opacity-70 transition-transform duration-750 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal via-luxury-charcoal/10" />
            <div className="absolute left-6 bottom-6 right-6 text-white space-y-1.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-luxury-champagne bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded">
                {settings.influencer2Name}
              </span>
              <p className="text-xs text-zinc-300 normal-case leading-relaxed font-light italic">
                {settings.influencer2Text}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 14. Social Proof counters */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-luxury-charcoal text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center select-none">
          <div className="space-y-1.5">
            <h3 className="font-serif text-3xl sm:text-5xl font-black text-luxury-gold">10,000+</h3>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 font-bold">Happy Customers</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-3xl sm:text-5xl font-black text-luxury-gold">4.9 ★</h3>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 font-bold">Verified Rating</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-3xl sm:text-5xl font-black text-luxury-gold">2M+</h3>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 font-bold">Styling Views</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-3xl sm:text-5xl font-black text-luxury-gold">100%</h3>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 font-bold">Custom Tailored</p>
          </div>
        </div>
      </motion.section>

      {/* 15. User Generated Content Feed (Instagram Social Wall) */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center space-y-2 mb-16">
          <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 block">
            #SAMMRenaissance
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-luxury-charcoal tracking-wide">
            Spotted on Instagram
          </h2>
          <p className="text-xs text-zinc-500 normal-case">
            Tag @sammrenaissance on Instagram for a chance to be featured on our luxury social wall!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            "DYMXZSdxogW",
            "DYrd7NExwXY",
            "DX8xm7sxsEN",
            "DXt_qw7ERgz",
            "DWHVCxFDznl",
            "DUuhdgzEZ7Y"
          ].map((reelId, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden shadow-md border border-zinc-150 bg-black aspect-[9/16] h-[480px] sm:h-[580px] mx-auto w-full max-w-[328px]">
              <iframe
                src={`https://www.instagram.com/reel/${reelId}/embed`}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                scrolling="no"
                allow="encrypted-media"
              />
            </div>
          ))}
        </div>
      </motion.section>

      {/* 16. Reviews System (Trustpilot-style) */}
      <motion.section
        id="reviews"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 bg-zinc-50 border-t border-b border-zinc-100"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold-dark bg-luxury-champagne px-2.5 py-1 rounded inline-block">
              Client Feedback
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-luxury-charcoal tracking-wide">
              What Our Community Says
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-zinc-700">
              <span className="text-lg font-black font-serif text-luxury-charcoal">4.9</span>
              <div className="flex text-luxury-gold">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="fill-luxury-gold" />
                ))}
              </div>
              <span className="text-zinc-400">• Verified 1,480+ Reviews</span>
            </div>
          </div>

          {/* Submitted reviews list */}
          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl p-6 border border-zinc-100 space-y-4 shadow-2xs">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-luxury-nude flex items-center justify-center font-serif text-sm font-bold text-luxury-charcoal uppercase border border-luxury-nude-dark">
                      {r.userName[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-luxury-charcoal uppercase tracking-wider">{r.userName}</p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">Reviewed: {r.productName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex text-luxury-gold">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={12} className="fill-luxury-gold text-luxury-gold" />
                      ))}
                    </div>
                    <span className="text-[9px] bg-green-50 text-green-600 border border-green-150 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                      Verified Buyer
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-luxury-charcoal uppercase tracking-wider">{r.title}</h5>
                  <p className="text-xs text-zinc-550 leading-relaxed normal-case">{r.text}</p>
                </div>
                
                {/* Images in review */}
                {r.photos && r.photos.length > 0 && (
                  <div className="flex gap-2">
                    {r.photos.map((pUrl, idx) => (
                      <img key={idx} src={pUrl} alt="User upload" className="w-12 h-16 object-cover rounded-lg border border-zinc-150" />
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-zinc-50 text-[10px] text-zinc-400">
                  <span>Posted on: {r.date}</span>
                  <button
                    onClick={() => incrementReviewHelpful(r.id)}
                    className="hover:text-luxury-gold-dark transition font-semibold"
                  >
                    Was this helpful? ({r.helpfulCount})
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form to submit review */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-150 mt-12 space-y-6">
            <h4 className="font-serif text-lg font-bold text-luxury-charcoal uppercase tracking-wider border-b border-zinc-50 pb-3">
              Write a Review
            </h4>
            
            {reviewSubmitted ? (
              <div className="bg-green-50 border border-green-150 p-4 text-center rounded-xl text-green-700 text-xs">
                🎉 Thank you! Your review has been submitted for moderation.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-550">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sanya Sen"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2 text-xs rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-550">Product Reviewed</label>
                    <select
                      value={reviewForm.productName}
                      onChange={(e) => setReviewForm({ ...reviewForm, productName: e.target.value })}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2 text-xs rounded-lg focus:outline-none bg-white uppercase text-[10px] tracking-wider"
                    >
                      <option value="Classic 7-Set Clip-In Hair Extensions">Classic 7-Set Clip-Ins</option>
                      <option value="Luxury Silk-Base Human Hair Topper">Luxury Silk topper</option>
                      <option value="Wispy Clip-in Hair Bangs">Wispy Bangs</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-550 block">Rating</label>
                    <div className="flex gap-1 pt-1.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                          className="focus:outline-none"
                        >
                          <Star
                            size={18}
                            className={
                              num <= reviewForm.rating
                                ? "fill-luxury-gold text-luxury-gold"
                                : "text-zinc-250 hover:text-luxury-gold"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-550">Review Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stunning hair match!"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2 text-xs rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-550">Review Message</label>
                  <textarea
                    required
                    placeholder="Share your experience with the blend, color matching, and volume..."
                    rows={4}
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                    className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2 text-xs rounded-lg focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-[10px] uppercase font-bold tracking-widest rounded-lg transition"
                >
                  Submit for Moderation
                </button>
              </form>
            )}
          </div>

        </div>
      </motion.section>



      {/* 18. Virtual Try-On Feature */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 bg-zinc-50 border-t border-b border-zinc-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <VirtualTryOn />
        </div>
      </motion.section>



      {/* 20. FAQ Section (Accordion) */}
      <motion.section
        id="faqs"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 bg-zinc-50 border-t border-b border-zinc-100"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 mb-16">
            <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 block">
              Support Center
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-luxury-charcoal tracking-wide">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="bg-white border border-zinc-150 rounded-2xl overflow-hidden shadow-2xs">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                  >
                    <span className="text-xs sm:text-sm font-bold text-luxury-charcoal uppercase tracking-wider">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-zinc-450 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 border-t border-zinc-50">
                      <p className="text-xs text-zinc-550 leading-relaxed normal-case">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 21. Premium Footer */}
      <Footer />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Quick View Modal Overlay */}
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
