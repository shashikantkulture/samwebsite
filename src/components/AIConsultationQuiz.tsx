"use client";

import React, { useState } from "react";
import { Star, Sparkles, RefreshCw, ShoppingCart, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { CartItem } from "../types";
import { motion, AnimatePresence } from "framer-motion";

export const AIConsultationQuiz: React.FC = () => {
  const { addToCart } = useCart();
  const { products } = useApp();

  const [step, setStep] = useState(0); // 0 is landing, 1-4 are questions, 5 is results
  const [answers, setAnswers] = useState({
    concern: "",
    size: "",
    color: "",
    fabric: ""
  });

  const QUESTIONS = [
    {
      id: "concern",
      title: "What is your primary styling occasion?",
      description: "We will curate apparel solutions specifically for your goals.",
      options: [
        { label: "Runway & Party Wear (Elegant evenings)", value: "partywear" },
        { label: "Casual Luxury (Smart & daily comfort)", value: "casual" },
        { label: "Kids Collections (Toddler gowns & tulle)", value: "kids" },
        { label: "Festive & Statement Pieces", value: "festive" }
      ]
    },
    {
      id: "size",
      title: "What sizing category do you need?",
      description: "This helps us recommend the correct fitting tags.",
      options: [
        { label: "Baby & Toddler (Ages 1 - 5 Years)", value: "kids" },
        { label: "Women's Small / Medium (S / M)", value: "small" },
        { label: "Women's Large / Extra Large (L / XL / 2XL)", value: "large" },
        { label: "One Size / Hair Accessories", value: "accessories" }
      ]
    },
    {
      id: "color",
      title: "What color palette fits your vibe?",
      description: "Select the primary tone you wish to express.",
      options: [
        { label: "Deep Classics (Maroon, Black, Espresso)", value: "dark" },
        { label: "Bold Vibrants (Neon Pink, Bright Red)", value: "vibrant" },
        { label: "Soft Ethereals (Cream, Blush Pink, Pastel)", value: "light" },
        { label: "Metallic & Shimmer (Golden, Shimmery textures)", value: "golden" }
      ]
    },
    {
      id: "fabric",
      title: "What is your preferred fabric sensation?",
      description: "Select the material you prefer for your look.",
      options: [
        { label: "Velvet (Rich, structured & printed)", value: "velvet" },
        { label: "Net / Organza (Light, whimsical & voluminous)", value: "net" },
        { label: "Silk / Satin (Frictionless, smooth & premium)", value: "silk" },
        { label: "Show all options", value: "all" }
      ]
    }
  ];

  const handleSelectOption = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (step < QUESTIONS.length) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setAnswers({ concern: "", size: "", color: "", fabric: "" });
    setStep(0);
  };

  // Perform algorithmic matching
  const getRecommendedProducts = () => {
    let matches = [...products];

    // 1. Filter by category based on size
    if (answers.size === "kids" || answers.concern === "kids") {
      matches = matches.filter((p) => p.category === "gowns" || p.category === "dresses");
    } else if (answers.size === "accessories") {
      matches = matches.filter((p) => p.category === "accessories");
    } else {
      matches = matches.filter((p) => p.category !== "gowns" && p.category !== "dresses");
    }

    // 2. Filter by occasion/styling goal
    if (answers.concern && answers.concern !== "kids") {
      const concernFiltered = matches.filter((p) => p.solutions.includes(answers.concern));
      if (concernFiltered.length > 0) matches = concernFiltered;
    }

    // 3. Filter by fabric keywords
    if (answers.fabric === "velvet") {
      const velvetFiltered = matches.filter((p) => p.description.toLowerCase().includes("velvet") || p.name.toLowerCase().includes("velvet"));
      if (velvetFiltered.length > 0) matches = velvetFiltered;
    } else if (answers.fabric === "net") {
      const netFiltered = matches.filter((p) => p.description.toLowerCase().includes("net") || p.description.toLowerCase().includes("tulle") || p.description.toLowerCase().includes("organza"));
      if (netFiltered.length > 0) matches = netFiltered;
    } else if (answers.fabric === "silk") {
      const silkFiltered = matches.filter((p) => p.description.toLowerCase().includes("silk") || p.description.toLowerCase().includes("satin") || p.name.toLowerCase().includes("silk"));
      if (silkFiltered.length > 0) matches = silkFiltered;
    }

    return matches.slice(0, 2); // Show top 2 recommendations
  };

  const recommended = getRecommendedProducts();

  const handleAddRecommended = (p: typeof products[0]) => {
    // Find the first variant matching selected size/color preference
    const matchedVar = p.variants[0];
    const item: CartItem = {
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      image: p.images[0],
      price: matchedVar ? matchedVar.price : p.price,
      salePrice: matchedVar ? matchedVar.salePrice : p.salePrice,
      quantity: 1,
      selectedColor: matchedVar ? matchedVar.color : "Default",
      selectedLength: matchedVar ? matchedVar.length : "Standard",
      selectedBase: matchedVar ? matchedVar.base : undefined,
      sku: matchedVar ? matchedVar.sku : `AI-${p.id}`
    };
    addToCart(item);
  };

  return (
    <div className="bg-luxury-nude border border-luxury-nude-dark rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto shadow-sm font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Step 0: Landing */}
        {step === 0 && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-6 max-w-2xl mx-auto py-6"
          >
            <div className="w-12 h-12 bg-luxury-champagne rounded-full flex items-center justify-center mx-auto text-luxury-gold-dark animate-bounce">
              <Sparkles size={22} />
            </div>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-luxury-charcoal tracking-wide leading-tight">
              AI Style & Size Finder
            </h3>
            <p className="text-xs sm:text-sm text-zinc-650 leading-relaxed normal-case">
              Confused about finding your perfect fit, size, or styling coords? Answer 4 simple questions about your occasion and fit goals, and our AI scanner will match you with your perfect SAMM Renaissance collections instantly.
            </p>
            <div className="pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-8 py-3.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-xs uppercase font-bold tracking-widest rounded-lg transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                Start Styling Now <ArrowRight size={14} />
              </button>
            </div>
            <p className="text-[10px] text-zinc-400">
              ⚡ Over 4,000+ custom stylings completed this week
            </p>
          </motion.div>
        )}

        {/* Steps 1 to 4: Questions */}
        {step > 0 && step <= QUESTIONS.length && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-luxury-nude-dark pb-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-zinc-500 hover:text-luxury-charcoal transition"
              >
                <ArrowLeft size={12} /> Back
              </button>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                Step {step} of {QUESTIONS.length}
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-1">
              <h4 className="text-lg sm:text-xl font-serif font-bold text-luxury-charcoal tracking-wide">
                {QUESTIONS[step - 1].title}
              </h4>
              <p className="text-xs text-zinc-500 normal-case">
                {QUESTIONS[step - 1].description}
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {QUESTIONS[step - 1].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelectOption(QUESTIONS[step - 1].id, opt.value)}
                  className="w-full text-left p-5 border border-zinc-200 bg-white hover:border-luxury-gold hover:bg-luxury-champagne/20 rounded-xl transition duration-200 focus:outline-none flex justify-between items-center group"
                >
                  <span className="text-xs sm:text-sm font-medium text-luxury-charcoal group-hover:text-luxury-gold-dark">
                    {opt.label}
                  </span>
                  <span className="w-5 h-5 rounded-full border border-zinc-200 group-hover:border-luxury-gold flex items-center justify-center flex-shrink-0 bg-zinc-50">
                    <span className="w-2.5 h-2.5 rounded-full bg-luxury-gold scale-0 group-hover:scale-100 transition-transform duration-200" />
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 5: Results */}
        {step > QUESTIONS.length && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center space-y-3 border-b border-luxury-nude-dark pb-6">
              <h4 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-charcoal tracking-wide">
                Your Custom Style Match
              </h4>
              <p className="text-xs text-zinc-500 max-w-lg mx-auto normal-case">
                Based on your preference for <strong className="text-luxury-charcoal">{answers.concern}</strong> and size <strong className="text-luxury-charcoal">{answers.size}</strong>, our AI recommends these designer pieces.
              </p>
            </div>

            {/* Recommendation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommended.length > 0 ? (
                recommended.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-zinc-100 flex flex-col justify-between shadow-xs hover:shadow-md transition">
                    <div className="relative aspect-w-4 aspect-h-3 h-52 bg-luxury-nude overflow-hidden">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-luxury-charcoal text-luxury-nude text-[8px] uppercase tracking-widest px-2.5 py-1 font-bold rounded">
                        {p.rating} ★ Rating
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <h5 className="text-sm font-serif font-bold text-luxury-charcoal line-clamp-1">{p.name}</h5>
                        <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed normal-case">{p.description}</p>
                        <p className="text-sm font-semibold text-luxury-gold-dark pt-1">Rs. {p.salePrice || p.price}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleAddRecommended(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-[10px] uppercase font-bold tracking-widest rounded transition-all duration-300"
                        >
                          <ShoppingCart size={12} /> Add to Bag
                        </button>
                        <a
                          href={`/product/${p.slug}`}
                          className="px-4 py-2.5 border border-zinc-200 hover:border-luxury-charcoal text-zinc-650 hover:text-luxury-charcoal text-[10px] uppercase font-bold tracking-widest rounded transition text-center"
                        >
                          Details
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-10 text-zinc-500 text-xs">
                  No exact match found. Browse our collections page for all options.
                </div>
              )}
            </div>

            {/* Consultation CTA Banner */}
            <div className="bg-luxury-champagne p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-luxury-gold/20">
              <div className="space-y-1.5 text-center sm:text-left">
                <h5 className="font-serif text-sm font-bold text-luxury-charcoal uppercase tracking-wider">
                  Still unsure about sizing and customized fit?
                </h5>
                <p className="text-xs text-zinc-650 normal-case">
                  Book a free 15-minute live WhatsApp or Video fitting call with our design studio. We will verify your measurements and ensure a perfect couture fit.
                </p>
              </div>
              <a
                href="#booking"
                onClick={() => {
                  const element = document.getElementById("booking");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-3 bg-white hover:bg-luxury-charcoal text-luxury-charcoal hover:text-white border border-luxury-gold/30 hover:border-transparent text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all duration-300 flex items-center gap-1.5 flex-shrink-0"
              >
                <Calendar size={13} /> Book Free Fitting Call
              </a>
            </div>

            {/* Reset button */}
            <div className="text-center pt-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-zinc-400 hover:text-luxury-charcoal transition"
              >
                <RefreshCw size={12} /> Restart Style Finder
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AIConsultationQuiz;
