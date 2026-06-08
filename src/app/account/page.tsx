"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User, ShoppingBag, MapPin, Award, Heart, LogOut, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import AnnouncementBar from "../../components/AnnouncementBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import QuickViewModal from "../../components/QuickViewModal";
import CartDrawer from "../../components/CartDrawer";

// Context & Data
import { useApp } from "../../context/AppContext";
import { useCart } from "../../context/CartContext";

function AccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { wishlist, products, refreshBookings } = useApp();
  const { cart } = useCart();

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; role: string } | null>(null);
  
  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState("");

  // Register Form States
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState("");

  // Active Tab
  const [activeTab, setActiveTab] = useState("orders");
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // Check login session on mount (Remember Me Auto-Login)
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setIsLoggedIn(true);
          refreshBookings(); // Load bookings for this user
        }
      })
      .catch((e) => console.error("Session fetch failed:", e));
  }, []);

  // Fetch orders when user logs in
  useEffect(() => {
    if (!currentUser) return;
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) {
          setOrders(data.orders);
        }
      })
      .catch((e) => console.error("Error fetching orders:", e));
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Please enter both your email address and password.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        refreshBookings();
        setLoginError("");
      } else {
        setLoginError(data.error || "Login failed. Please verify credentials.");
      }
    } catch (err) {
      setLoginError("Connection error. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setRegError("Please fill in all registration fields.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, name: regName, password: regPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        refreshBookings();
        setRegError("");
        setIsRegisterMode(false);
      } else {
        setRegError(data.error || "Registration failed.");
      }
    } catch (err) {
      setRegError("Connection error. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout request failed:", e);
    }
    setCurrentUser(null);
    setIsLoggedIn(false);
    router.push("/account");
  };

  // Filter wishlist items
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  // Determine loyalty points dynamically based on name length for visual feedback
  const points = currentUser ? (currentUser.name.length * 60) + 150 : 250;
  const tier = points > 500 ? "Platinum Elite Member" : points > 350 ? "Gold Tier Member" : "Silver Tier Member";

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen bg-white">
        <AnnouncementBar />
        <Header />
        <div className="h-[120px]" />
        
        {/* Premium Authentication Form Section */}
        <div className="max-w-md mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-zinc-150 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6"
          >
            {!isRegisterMode ? (
              // SIGN IN MODE
              <>
                <div className="text-center space-y-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-luxury-gold-dark font-bold">
                    Welcome to SAMM Renaissance
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-luxury-charcoal uppercase tracking-wider">
                    Account Sign In
                  </h2>
                  <p className="text-xs text-zinc-500 normal-case">
                    Enter your credentials to manage orders and access your designer wardrobe.
                  </p>
                </div>

                {loginError && (
                  <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold text-center">
                    ⚠️ {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-550">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sanya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-4 py-3 text-xs rounded-xl focus:outline-none transition-all duration-200 bg-zinc-50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-550">Password</label>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-luxury-gold-dark hover:underline cursor-pointer">
                        Forgot?
                      </span>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-4 py-3 text-xs rounded-xl focus:outline-none transition-all duration-200 bg-zinc-50 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 select-none py-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-zinc-350 text-luxury-gold focus:ring-luxury-gold h-4 w-4"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-zinc-650 cursor-pointer">
                      Remember me for 30 days
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-[10px] uppercase font-bold tracking-widest rounded-xl transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    Sign In
                  </button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-zinc-500">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setIsRegisterMode(true)}
                      className="text-luxury-gold-dark font-bold hover:underline cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </>
            ) : (
              // SIGN UP (REGISTER) MODE
              <>
                <div className="text-center space-y-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-luxury-gold-dark font-bold">
                    Join SAMM Renaissance
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-luxury-charcoal uppercase tracking-wider">
                    Create Account
                  </h2>
                  <p className="text-xs text-zinc-500 normal-case">
                    Sign up to track purchases, save wishlist items, and schedule fitting calls.
                  </p>
                </div>

                {regError && (
                  <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold text-center">
                    ⚠️ {regError}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-550">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sanya Sen"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-4 py-3 text-xs rounded-xl focus:outline-none transition-all duration-200 bg-zinc-50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-550">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sanya@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-4 py-3 text-xs rounded-xl focus:outline-none transition-all duration-200 bg-zinc-50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-550">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-4 py-3 text-xs rounded-xl focus:outline-none transition-all duration-200 bg-zinc-50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-550">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-4 py-3 text-xs rounded-xl focus:outline-none transition-all duration-200 bg-zinc-50 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-[10px] uppercase font-bold tracking-widest rounded-xl transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    Register
                  </button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-zinc-500">
                    Already have an account?{" "}
                    <button
                      onClick={() => setIsRegisterMode(false)}
                      className="text-luxury-gold-dark font-bold hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>

        <Footer />
        <CartDrawer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Header */}
      <Header />

      {/* Spacing Offset */}
      <div className="h-[120px]" />

      {/* Title block */}
      <div className="bg-luxury-nude py-12 border-b border-luxury-nude-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 rounded-full bg-luxury-champagne flex items-center justify-center font-serif text-2xl font-black text-luxury-charcoal uppercase border border-luxury-gold/20 shadow-xs">
              {currentUser?.name[0]}
            </div>
            <div className="space-y-1">
              <h1 className="font-serif text-2xl font-bold text-luxury-charcoal tracking-wide">
                Welcome back, {currentUser?.name}
              </h1>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                ⭐ {tier} | <span className="text-luxury-gold-dark">{points} Points Balance</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 border border-zinc-200 hover:border-red-500 text-zinc-500 hover:text-red-500 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all flex items-center gap-1.5 bg-white shadow-2xs"
          >
            <LogOut size={13} /> Log Out
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <nav className="lg:col-span-3 bg-zinc-50 p-6 rounded-2xl border border-zinc-150 shadow-2xs space-y-2 text-xs font-bold uppercase tracking-wider font-sans">
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 transition ${
                activeTab === "orders" ? "bg-luxury-charcoal text-white shadow-xs" : "text-zinc-650 hover:bg-zinc-100"
              }`}
            >
              <ShoppingBag size={15} /> Order History ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 transition ${
                activeTab === "addresses" ? "bg-luxury-charcoal text-white shadow-xs" : "text-zinc-650 hover:bg-zinc-100"
              }`}
            >
              <MapPin size={15} /> Saved Addresses
            </button>

            <button
              onClick={() => setActiveTab("rewards")}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 transition ${
                activeTab === "rewards" ? "bg-luxury-charcoal text-white shadow-xs" : "text-zinc-650 hover:bg-zinc-100"
              }`}
            >
              <Award size={15} /> Loyalty Points
            </button>

            <button
              onClick={() => setActiveTab("wishlist")}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 transition ${
                activeTab === "wishlist" ? "bg-luxury-charcoal text-white shadow-xs" : "text-zinc-650 hover:bg-zinc-100"
              }`}
            >
              <Heart size={15} /> Wishlist ({wishlist.length})
            </button>
          </nav>

          {/* Main Dashboard Panel content */}
          <main className="lg:col-span-9 bg-white rounded-2xl border border-zinc-150 p-6 sm:p-8 shadow-2xs min-h-[400px]">
            
            {/* Tab: Orders */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal pb-2 border-b border-zinc-55">
                  Order History & Tracking
                </h3>

                {orders.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400 space-y-4">
                    <ShoppingBag size={32} className="mx-auto text-zinc-200" />
                    <p className="text-xs">You have not placed any orders yet.</p>
                    <Link href="/shop" className="inline-block px-6 py-2.5 bg-luxury-charcoal text-white text-[10px] uppercase font-bold tracking-widest rounded-lg">
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((o) => (
                      <div key={o.orderId} className="border border-zinc-150 rounded-2xl p-5 sm:p-6 space-y-5 text-xs text-luxury-charcoal">
                        
                        {/* Order info row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-50 pb-4">
                          <div>
                            <p className="font-bold text-sm text-luxury-charcoal uppercase">Order ID: {o.orderId}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Placed: {o.date} | Payment: {o.payment}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[9px] ${
                            o.status.includes("Delivered") 
                              ? "bg-green-50 text-green-600 border border-green-150" 
                              : "bg-amber-50 text-amber-600 border border-amber-150 animate-pulse"
                          }`}>
                            {o.status}
                          </span>
                        </div>

                        {/* Order Items list */}
                        <div className="space-y-4 divide-y divide-zinc-50">
                          {o.items.map((item: any, index: number) => (
                            <div key={index} className="pt-3 first:pt-0 flex gap-4">
                              <img src={item.image} alt="" className="w-12 h-16 object-cover rounded bg-zinc-50 border border-zinc-100 flex-shrink-0" />
                              <div className="flex-1 flex justify-between">
                                <div>
                                  <h4 className="font-bold text-luxury-charcoal">{item.productName}</h4>
                                  <p className="text-[10px] text-zinc-455 mt-0.5">
                                    Size/Color: {item.selectedColor} | Qty: {item.quantity}
                                  </p>
                                </div>
                                <span className="font-bold">Rs. {(item.salePrice || item.price) * item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tracking details */}
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/50 space-y-3.5">
                          <span className="text-[9px] uppercase font-black tracking-widest text-zinc-455 block">
                            Live delivery Status
                          </span>
                          
                          <div className="flex justify-between text-[9px] font-bold text-zinc-400 relative">
                            {/* Track bar progress line */}
                            <div className="absolute top-1.5 left-0 right-0 h-1 bg-zinc-200 z-0">
                              <div className={`h-full bg-luxury-gold ${o.status.includes("Delivered") ? "w-full" : "w-1/2"}`} />
                            </div>

                            <span className="text-luxury-charcoal bg-white z-10 px-1 border border-zinc-100 rounded">Placed</span>
                            <span className={`${!o.status.includes("Delivered") ? "text-luxury-charcoal font-bold" : ""} bg-white z-10 px-1 border border-zinc-100 rounded`}>Dispatched</span>
                            <span className={`${o.status.includes("Delivered") ? "text-green-600 font-bold border-green-200" : ""} bg-white z-10 px-1 border border-zinc-100 rounded`}>Delivered</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] border-t border-zinc-50 pt-4">
                          <span className="text-zinc-455">Ship to Address: <strong className="text-zinc-650 normal-case">{o.address}</strong></span>
                          <span className="font-bold text-base text-luxury-gold-dark">Total: Rs. {o.total}</span>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Saved Addresses */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal pb-2 border-b border-zinc-55">
                  Saved Address Book
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Default Address */}
                  <div className="border border-luxury-gold/20 bg-luxury-nude p-5 rounded-2xl space-y-4 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-luxury-nude-dark">
                      <span className="font-bold text-luxury-charcoal uppercase tracking-wider">Default Shipping Address</span>
                      <span className="text-[8px] bg-luxury-gold text-white uppercase tracking-widest font-bold px-1.5 rounded">Primary</span>
                    </div>
                    
                    <div className="space-y-1 text-zinc-650">
                      <p className="font-bold text-luxury-charcoal">{currentUser?.name}</p>
                      <p className="normal-case">Bandra West Apt 4B, Linking Road</p>
                      <p className="normal-case">Mumbai, Maharashtra, 400050</p>
                      <p className="normal-case">India</p>
                      <p>📞 Phone: +91 98765 XXXXX</p>
                    </div>
                  </div>

                  {/* Add address mock */}
                  <div className="border border-dashed border-zinc-300 hover:border-luxury-charcoal p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 text-xs text-zinc-400 hover:text-luxury-charcoal transition cursor-pointer">
                    <MapPin size={24} className="stroke-[1.5]" />
                    <span className="font-bold uppercase tracking-wider">Add New Address</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Loyalty Rewards */}
            {activeTab === "rewards" && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal pb-2 border-b border-zinc-55">
                  Loyalty Points & Rewards
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
                  <div className="border border-zinc-150 p-5 rounded-2xl bg-zinc-50 space-y-1">
                    <p className="text-zinc-400 uppercase tracking-widest text-[9px] font-bold">Total Balance</p>
                    <p className="text-2xl font-serif font-black text-luxury-gold-dark">{points} Points</p>
                  </div>
                  <div className="border border-zinc-150 p-5 rounded-2xl bg-zinc-50 space-y-1">
                    <p className="text-zinc-400 uppercase tracking-widest text-[9px] font-bold">Redeem Value</p>
                    <p className="text-2xl font-serif font-black text-luxury-gold-dark">Rs. {points}</p>
                  </div>
                  <div className="border border-zinc-150 p-5 rounded-2xl bg-zinc-50 space-y-1">
                    <p className="text-zinc-400 uppercase tracking-widest text-[9px] font-bold">Tier Class</p>
                    <p className="text-2xl font-serif font-black text-luxury-gold-dark">{tier.split(" Member")[0]}</p>
                  </div>
                </div>

                <div className="bg-luxury-nude p-5 rounded-2xl border border-luxury-nude-dark space-y-3 text-xs text-luxury-charcoal leading-relaxed">
                  <span className="text-[10px] uppercase font-bold tracking-widest block text-luxury-gold-dark">
                    How to redeem points
                  </span>
                  <p className="normal-case">
                    Points are automatically generated on every purchase (1 Point for every Rs. 10 spent). Use coupon code <strong>REDEEM{points}</strong> at checkout to apply your Rs. {points} wallet points balance to your next shopping bag!
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Wishlist */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal pb-2 border-b border-zinc-55">
                  My Wishlist
                </h3>

                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400 space-y-4">
                    <Heart size={32} className="mx-auto text-zinc-200" />
                    <p className="text-xs">Your wishlist is currently empty.</p>
                    <Link href="/shop" className="inline-block px-6 py-2.5 bg-luxury-charcoal text-white text-[10px] uppercase font-bold tracking-widest rounded-lg">
                      Shop Collections
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onQuickView={(id) => setQuickViewId(id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
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

export default function Account() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans text-xs uppercase tracking-widest text-zinc-400">
        <RefreshCw className="animate-spin text-luxury-gold mb-2" size={24} />
        Loading SAMM Renaissance Dashboard...
      </div>
    }>
      <AccountContent />
    </Suspense>
  );
}
