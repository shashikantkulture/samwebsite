"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ANNOUNCEMENTS = [
  "✨ Worldwide Luxury Shipping | Free Shipping Over Rs. 5000 ✨",
  "💫 New Launch: Velvet Corset Jumpsuits & Kids Fairy Gowns Now Live! 💫",
  "🔥 Limited Offer: 10% Off Your First Order with Code: SAMM10 🔥",
  "📆 Book a Free 1-on-1 Virtual Styling & Fitting Consultation 📆"
];

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  return (
    <div className="bg-luxury-charcoal text-luxury-nude text-xs uppercase tracking-widest fixed top-0 left-0 right-0 z-50 overflow-hidden px-10 transition-all select-none h-10 flex items-center">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 hover:text-luxury-gold transition duration-200"
          aria-label="Previous announcement"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="w-full text-center font-medium transition-all duration-500 ease-in-out">
          {ANNOUNCEMENTS[currentIndex]}
        </div>

        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-luxury-gold transition duration-200"
          aria-label="Next announcement"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
export default AnnouncementBar;
