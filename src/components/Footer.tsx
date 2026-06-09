"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Globe, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [country, setCountry] = useState("United States (USD)");
  const [lang, setLang] = useState("English");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-luxury-charcoal text-zinc-400 text-xs tracking-wider border-t border-zinc-900 font-sans">
      


      {/* Main Links grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        <div className="col-span-2 lg:col-span-1 space-y-4">
          <Link href="/" className="flex flex-col">
            <span className="text-white text-lg font-serif font-black tracking-[0.2em] uppercase">SAMM RENAISSANCE</span>
            <span className="text-[7px] tracking-[0.4em] uppercase text-luxury-gold -mt-1 font-bold">LUXURY APPAREL & ACCESSORIES</span>
          </Link>
          <p className="text-[11px] normal-case leading-relaxed text-zinc-500">
            Designing premium custom-wear gowns, jumpsuits, co-ord sets, and luxury hair accessories to deliver instant confidence and premium runway-level aesthetics.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="https://www.instagram.com/sammrenaissanceofficial" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition flex items-center">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/sammrenaissanceofficial/reels/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition flex items-center">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition flex items-center">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163c-.272-1.025-1.077-1.83-2.101-2.102C19.537 3.5 12 3.5 12 3.5s-7.537 0-9.397.561c-1.025.272-1.83 1.077-2.102 2.102C0 8.023 0 12 0 12s0 3.977.503 5.837c.272 1.025 1.077 1.83 2.102 2.102C4.463 20.5 12 20.5 12 20.5s7.537 0 9.397-.561c1.024-.272 1.83-1.077 2.101-2.102C24 15.977 24 12 24 12s0-3.977-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://in.pinterest.com/sammrenaissanceofficial" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition flex items-center">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.63-.13-1.6.03-2.3l1.43-6.04s-.36-.73-.36-1.8c0-1.7 1-2.97 2.2-2.97 1.05 0 1.55.79 1.55 1.73 0 1.06-.67 2.63-1.02 4.1-.3 1.22.6 2.22 1.8 2.22 2.16 0 3.82-2.28 3.82-5.58 0-2.9-2.1-4.94-5.08-4.94-3.46 0-5.5 2.6-5.5 5.28 0 1.05.4 2.18.9 2.8a.33.33 0 0 1 .08.27l-.33 1.37c-.05.22-.2.3-.43.18-1.57-.73-2.55-3.03-2.55-4.88 0-3.98 2.9-7.65 8.35-7.65 4.38 0 7.8 3.12 7.8 7.3 0 4.36-2.75 7.87-6.56 7.87-1.28 0-2.48-.67-2.9-1.46l-.78 3c-.28 1.09-1 2.45-1.5 3.26A12 12 0 1 0 12 0z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Link Columns */}
        <div>
          <h4 className="text-white uppercase tracking-widest font-semibold mb-4 text-[10px]">Shop Collections</h4>
          <ul className="space-y-2 text-zinc-500">
            <li><Link href="/shop?category=jumpsuits" className="hover:text-white transition">Corset Jumpsuits</Link></li>
            <li><Link href="/shop?category=gowns" className="hover:text-white transition">Kids Fairy Gowns</Link></li>
            <li><Link href="/shop?category=coords" className="hover:text-white transition">Co-Ord Sets</Link></li>
            <li><Link href="/shop?category=tops" className="hover:text-white transition">Designer Tops</Link></li>
            <li><Link href="/kikis-hair" className="hover:text-white transition">Kikis Hair (Scrunchies)</Link></li>
            <li><Link href="/shop?category=accessories" className="hover:text-white transition">Textured Hair Bows</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white uppercase tracking-widest font-semibold mb-4 text-[10px]">Customer Care</h4>
          <ul className="space-y-2 text-zinc-500">
            <li><Link href="/account" className="hover:text-white transition">Order Tracking</Link></li>
            <li><Link href="/#contact" className="hover:text-white transition">Contact Support</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white uppercase tracking-widest font-semibold mb-4 text-[10px]">Contact & Location</h4>
          <p className="text-zinc-500 normal-case mb-2 leading-relaxed">
            <strong>Email:</strong> <a href="mailto:teamsammrenaissance@gmail.com" className="hover:text-white transition">teamsammrenaissance@gmail.com</a>
          </p>
          <p className="text-zinc-500 normal-case mb-2 leading-relaxed">
            <strong>Phone:</strong> <a href="tel:+919120250862" className="hover:text-white transition">+91 9120250862</a>
          </p>
          <p className="text-zinc-500 normal-case leading-relaxed mt-2">
            <strong>Boutique Address:</strong><br />
            SAMM Renaissance - Fashion Boutique Arjunganj, 3rd Floor, Ahmamau, Lucknow, UP, India - 226002
          </p>
        </div>
      </div>

      {/* Bottom bar with dropdown filters */}
      <div className="bg-zinc-950 border-t border-zinc-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Selectors */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Globe size={13} />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-transparent border border-zinc-800 rounded px-2.5 py-1 text-zinc-400 focus:outline-none focus:border-luxury-gold uppercase text-[10px] tracking-wider"
              >
                <option value="United States (USD)" className="bg-luxury-charcoal">United States (USD)</option>
                <option value="India (INR)" className="bg-luxury-charcoal">India (INR)</option>
                <option value="United Kingdom (GBP)" className="bg-luxury-charcoal">United Kingdom (GBP)</option>
                <option value="Canada (CAD)" className="bg-luxury-charcoal">Canada (CAD)</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1.5 text-zinc-500">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent border border-zinc-800 rounded px-2.5 py-1 text-zinc-400 focus:outline-none focus:border-luxury-gold uppercase text-[10px] tracking-wider"
              >
                <option value="English" className="bg-luxury-charcoal">English</option>
                <option value="Hindi" className="bg-luxury-charcoal">Hindi</option>
                <option value="Spanish" className="bg-luxury-charcoal">Spanish</option>
              </select>
            </div>
          </div>

          {/* Credits */}
          <div className="text-zinc-600 flex flex-col sm:flex-row items-center gap-2 text-[10px]">
            <span>&copy; {new Date().getFullYear()} SAMM RENAISSANCE. All Rights Reserved.</span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-0.5">
              Crafted for confidence with <Heart size={10} className="text-red-500 fill-red-500" /> & premium custom craftsmanship
            </span>
          </div>

          {/* Secure Payment Options */}
          <div className="flex gap-2 opacity-40">
            <span className="bg-zinc-850 px-2 py-1 rounded text-[9px] uppercase font-bold border border-zinc-800">Stripe</span>
            <span className="bg-zinc-850 px-2 py-1 rounded text-[9px] uppercase font-bold border border-zinc-800">Razorpay</span>
            <span className="bg-zinc-850 px-2 py-1 rounded text-[9px] uppercase font-bold border border-zinc-800">PayPal</span>
            <span className="bg-zinc-850 px-2 py-1 rounded text-[9px] uppercase font-bold border border-zinc-800">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
