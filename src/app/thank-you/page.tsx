"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, ShoppingBag, MapPin, Tag, ArrowRight, Home, RefreshCw, Award, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// Components
import AnnouncementBar from "../../components/AnnouncementBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CartDrawer from "../../components/CartDrawer";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdParam = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set document title
    document.title = "Order Successful | SAMM Renaissance";

    // Load orders from LocalStorage
    const savedOrdersStr = localStorage.getItem("luxury_orders");
    if (savedOrdersStr) {
      try {
        const savedOrders = JSON.parse(savedOrdersStr);
        if (Array.isArray(savedOrders) && savedOrders.length > 0) {
          // If orderId is provided in URL, find it. Otherwise, fallback to the most recent order.
          const foundOrder = orderIdParam
            ? savedOrders.find((o: any) => o.orderId === orderIdParam)
            : savedOrders[0];

          if (foundOrder) {
            setOrder(foundOrder);
          }
        }
      } catch (err) {
        console.error("Error parsing luxury_orders", err);
      }
    }
    setLoading(false);
  }, [orderIdParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-luxury-nude font-sans text-xs uppercase tracking-widest text-zinc-500">
        <RefreshCw className="animate-spin text-luxury-gold mb-2" size={24} />
        Retrieving Order Details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="relative min-h-screen bg-luxury-nude">
        <AnnouncementBar />
        <Header />
        <div className="h-[120px]" />
        <div className="max-w-md mx-auto py-24 px-6 text-center space-y-6">
          <ShoppingBag size={48} className="text-zinc-350 stroke-[1.5] mx-auto animate-bounce" />
          <h2 className="font-serif text-2xl font-bold uppercase text-luxury-charcoal">No Recent Order Found</h2>
          <p className="text-xs text-zinc-500 normal-case leading-relaxed">
            We couldn't locate any recent transaction records on this device. Explore our designer collection to place an order.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-xs uppercase font-bold tracking-widest rounded-lg transition duration-300 shadow-md"
          >
            Shop Collection
          </Link>
        </div>
        <Footer />
        <CartDrawer />
      </div>
    );
  }

  // Calculate dynamic loyalty points earned (1 point per Rs. 10 spent)
  const orderTotalNum = Number(order.total) || 0;
  const pointsEarned = Math.floor(orderTotalNum / 10);

  // Determine active tracking step based on order status
  // Options: "Processing / Dispatched", "Delivered"
  const isDelivered = order.status && order.status.includes("Delivered");

  return (
    <div className="relative min-h-screen bg-luxury-nude text-luxury-charcoal">
      <AnnouncementBar />
      <Header />
      <div className="h-[120px]" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header Success Section */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="w-20 h-20 bg-white border border-green-200 rounded-full flex items-center justify-center mx-auto shadow-md relative"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-green-500/10 border border-green-500/20"
              />
              <CheckCircle size={38} className="text-green-500 z-10" />
            </motion.div>

            <div className="space-y-2">
              <span className="inline-block text-[9px] uppercase font-bold tracking-widest text-luxury-gold-dark bg-white px-3 py-1 rounded-full border border-luxury-nude-dark shadow-2xs">
                Transaction Successful
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-black text-luxury-charcoal tracking-wide uppercase">
                Thank You For Your Patronage
              </h1>
              <p className="max-w-lg mx-auto text-xs text-zinc-500 normal-case leading-relaxed">
                Your payment was received successfully. We are preparing your custom designer apparel items. A confirmation email has been sent to <strong>{order.email}</strong>.
              </p>
            </div>
          </div>

          {/* Grid Layout: Left Order Detail Card, Right Items and Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Status & Logistics */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Order Metadata Box */}
              <div className="bg-white rounded-3xl p-6 border border-luxury-nude-dark shadow-xs space-y-5">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold block">Order Reference</span>
                    <h3 className="font-bold text-base text-luxury-charcoal uppercase tracking-wider">{order.orderId}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold block">Status</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      isDelivered 
                        ? "bg-green-50 text-green-600 border border-green-150" 
                        : "bg-amber-50 text-amber-600 border border-amber-150 animate-pulse"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold block mb-1">Date Placed</span>
                    <span className="font-semibold">{order.date}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold block mb-1">Payment Portal</span>
                    <span className="font-semibold text-luxury-gold-dark">{order.payment}</span>
                  </div>
                </div>

                {order.transactionId && (
                  <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-150 text-[10px] text-zinc-500 flex justify-between items-center">
                    <span>Razorpay ID:</span>
                    <code className="font-mono text-luxury-charcoal font-semibold">{order.transactionId}</code>
                  </div>
                )}
              </div>

              {/* Live Status Tracker */}
              <div className="bg-white rounded-3xl p-6 border border-luxury-nude-dark shadow-xs space-y-6">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 border-b border-zinc-50 pb-3">
                  Live Dispatch Logistics
                </h4>

                <div className="relative pl-6 space-y-8 border-l border-zinc-200">
                  {/* Step 1: Placed */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-luxury-gold flex items-center justify-center ring-4 ring-white shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                    <div className="text-xs">
                      <p className="font-bold text-luxury-charcoal">Order Placed & Confirmed</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Payment successfully processed via {order.payment}.</p>
                    </div>
                  </div>

                  {/* Step 2: Tailoring / Prep */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs ${
                      !isDelivered ? "bg-luxury-gold animate-pulse" : "bg-luxury-gold"
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                    <div className="text-xs">
                      <p className="font-bold text-luxury-charcoal">Custom Couture Preparation</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Garments are being cut, tailored, and lint-checked.</p>
                    </div>
                  </div>

                  {/* Step 3: Dispatched */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs ${
                      isDelivered ? "bg-luxury-gold" : "bg-zinc-200"
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                    <div className="text-xs">
                      <p className={`font-bold ${isDelivered ? "text-luxury-charcoal" : "text-zinc-400"}`}>Dispatched / In Transit</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Package forwarded to our luxury courier services.</p>
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs ${
                      isDelivered ? "bg-green-500" : "bg-zinc-200"
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                    <div className="text-xs">
                      <p className={`font-bold ${isDelivered ? "text-green-600" : "text-zinc-400"}`}>Delivered Securely</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Parcel signed and completed at address destination.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address Block */}
              <div className="bg-white rounded-3xl p-6 border border-luxury-nude-dark shadow-xs space-y-4">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 border-b border-zinc-50 pb-3 flex items-center gap-1.5">
                  <MapPin size={13} className="text-luxury-gold" /> Destination Address
                </h4>
                <div className="text-xs space-y-1.5">
                  <p className="font-bold text-luxury-charcoal">Delivery Destination Details</p>
                  <p className="text-zinc-500 normal-case leading-relaxed">{order.address}</p>
                </div>
              </div>

            </div>

            {/* Right Column: Items & Loyalty Rewards */}
            <div className="md:col-span-5 space-y-6">
              
              {/* Order Items Table */}
              <div className="bg-white rounded-3xl p-6 border border-luxury-nude-dark shadow-xs space-y-5">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 border-b border-zinc-50 pb-3">
                  Designer Apparel Items
                </h4>

                <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto no-scrollbar">
                  {order.items && order.items.map((item: any, idx: number) => (
                    <div key={item.sku || idx} className="py-3.5 flex gap-3.5 first:pt-0 last:pb-0 text-xs">
                      <img 
                        src={item.image} 
                        alt="" 
                        className="w-12 h-16 object-cover rounded bg-zinc-50 border border-zinc-100 flex-shrink-0" 
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between font-bold text-luxury-charcoal">
                            <span className="line-clamp-1">{item.productName}</span>
                            <span className="text-zinc-650 flex-shrink-0 ml-2">Rs. {((item.salePrice || item.price) * item.quantity).toFixed(2)}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1">
                            Size/Color: {item.selectedColor || "Maroon"} | Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-zinc-150 pt-4 space-y-2.5 text-xs font-semibold">
                  <div className="flex justify-between border-t border-zinc-100 pt-3 text-sm font-bold text-luxury-charcoal">
                    <span>Grand Total Paid (INR)</span>
                    <span className="text-luxury-gold-dark text-base">Rs. {order.total}</span>
                  </div>
                </div>
              </div>

              {/* Loyalty Reward Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-zinc-900 text-white rounded-3xl p-6 border border-luxury-gold/30 shadow-md space-y-4 relative overflow-hidden"
              >
                {/* Decorative glow */}
                <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-luxury-gold/15 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-2 text-luxury-gold">
                  <Award size={18} />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Patronage Rewards</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-bold text-white tracking-wide">
                    +{pointsEarned} Loyalty Points Added
                  </h4>
                  <p className="text-[10px] text-zinc-400 normal-case leading-relaxed">
                    Points have been credited to your account dashboard (1 Point for every Rs. 10 spent). Use your points for future purchases.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-[9px] text-zinc-350 flex justify-between items-center">
                  <span>Your Promo Code:</span>
                  <span className="font-bold uppercase tracking-widest text-luxury-gold">REDEEM{pointsEarned}</span>
                </div>
              </motion.div>

              {/* CTAs */}
              <div className="flex flex-col gap-3.5 pt-2">
                <Link
                  href="/account?tab=orders"
                  className="w-full py-3.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-[10px] uppercase font-bold tracking-widest rounded-xl transition duration-300 shadow-md hover:shadow-lg text-center flex items-center justify-center gap-2"
                >
                  Track in Customer Wardrobe <ArrowRight size={13} />
                </Link>
                <Link
                  href="/shop"
                  className="w-full py-3.5 border border-zinc-200 hover:border-luxury-charcoal text-zinc-500 hover:text-luxury-charcoal text-[10px] uppercase font-bold tracking-widest rounded-xl transition duration-300 text-center flex items-center justify-center gap-2 bg-white/50 backdrop-blur-xs"
                >
                  <Home size={13} /> Return to Shop
                </Link>
              </div>

              {/* Concierge Guarantee */}
              <div className="flex items-center justify-center gap-2 text-center text-zinc-450 pt-2">
                <ShieldCheck size={14} className="text-green-500" />
                <span className="text-[9px] uppercase font-bold tracking-wider">SAMM Concierge Insured Delivery</span>
              </div>

            </div>

          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function ThankYou() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-luxury-nude font-sans text-xs uppercase tracking-widest text-zinc-500">
        <RefreshCw className="animate-spin text-luxury-gold mb-2" size={24} />
        Loading Order Confirmation...
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
