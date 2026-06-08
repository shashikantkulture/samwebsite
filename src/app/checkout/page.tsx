"use client";

import React, { useState } from "react";
import { ShoppingBag, ArrowLeft, CreditCard, Shield, Truck, Sparkles, CheckCircle, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "../../context/CartContext";

export default function Checkout() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    discountValue,
    total,
    appliedCoupon,
    applyCoupon,
    clearCart,
    freeShippingThreshold
  } = useCart();

  // Address State
  const [email, setEmail] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    country: "United States",
    zip: "",
    phone: ""
  });

  const [paymentMethod, setPaymentMethod] = useState<"razorpay">("razorpay");

  // Checkout flow redirect active

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const success = applyCoupon(couponCode);
    if (success) {
      setCouponCode("");
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code! Try SAMM10.");
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !address.firstName || !address.lastName || !address.street || !address.city || !address.zip || !address.phone) {
      alert("Please fill out all shipping fields.");
      return;
    }


    const shippingCost = subtotal >= freeShippingThreshold ? 0 : 150;
    const expressCost = shippingMethod === "express" ? 150 : 0;
    const grandTotalVal = total + shippingCost + expressCost;
    const randomOrder = `ORD-${Date.now().toString().slice(-6)}`;

    if (paymentMethod === "razorpay") {
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        alert("Razorpay payment gateway is loading, please try again in a moment.");
        return;
      }

      const options = {
        key: "rzp_test_SjkodhDKf4SYr7",
        amount: Math.round(grandTotalVal * 100), // Amount in paise
        currency: "INR",
        name: "SAMM RENAISSANCE",
        description: "Designer Apparel Purchase",
        image: "https://cdn.shopify.com/s/files/1/0932/4796/3414/files/PRELIMENARY-34.png?v=1771478209",
        handler: function (response: any) {
          const newOrder = {
            orderId: randomOrder,
            itemsCount: cart.length,
            items: cart,
            date: new Date().toISOString().split("T")[0],
            total: grandTotalVal.toFixed(2),
            status: "Processing / Dispatched",
            address: `${address.street}, ${address.city}, ${address.zip}`,
            payment: "RAZORPAY",
            email,
            transactionId: response.razorpay_payment_id
          };

          const savedOrders = localStorage.getItem("luxury_orders");
          const currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
          localStorage.setItem("luxury_orders", JSON.stringify([newOrder, ...currentOrders]));

          const statsStr = localStorage.getItem("luxury_admin_sales");
          const currentSales = statsStr ? Number(statsStr) : 12480;
          localStorage.setItem("luxury_admin_sales", (currentSales + grandTotalVal).toString());

          clearCart();
          router.push(`/thank-you?orderId=${randomOrder}`);
        },
        prefill: {
          name: `${address.firstName} ${address.lastName}`,
          email: email,
          contact: address.phone
        },
        notes: {
          address: `${address.street}, ${address.city}, ${address.zip}`
        },
        theme: {
          color: "#0FB2AE"
        },
        modal: {
          ondismiss: function() {
            console.log("Razorpay payment modal closed by user.");
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
      return;
    }

  };

  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 150;
  const expressCost = shippingMethod === "express" ? 150 : 0;
  const grandTotal = total + shippingCost + expressCost;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      
      {/* Mini sticky Header */}
      <div className="bg-white border-b border-zinc-100 py-5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/shop" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-luxury-charcoal uppercase font-bold tracking-wider">
            <ArrowLeft size={14} /> Back to Shop
          </Link>
          <span className="text-lg font-serif font-black tracking-widest">SAMM RENAISSANCE</span>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Shield size={14} className="text-green-500" /> Secure SSL checkout
          </div>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="max-w-md mx-auto py-20 px-6 text-center space-y-6">
          <ShoppingBag size={48} className="text-zinc-200 stroke-[1.5] mx-auto" />
          <h2 className="font-serif text-xl font-bold uppercase text-luxury-charcoal">Your bag is empty</h2>
          <p className="text-xs text-zinc-500 normal-case leading-relaxed">
            Please add designer apparel items to your cart before proceeding to checkout.
          </p>
          <Link href="/shop" className="inline-block px-6 py-3 bg-luxury-charcoal text-white text-xs uppercase font-bold tracking-widest rounded-lg">
            Shop Collections
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column Shipping & payment */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Contact info */}
              <div className="bg-white rounded-2xl p-6 border border-zinc-150 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal pb-2 border-b border-zinc-50">
                  1. Contact Information
                </h3>
                <div className="space-y-1 text-xs">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 block">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2 rounded-lg focus:outline-none"
                  />
                  <p className="text-[9px] text-zinc-400">Used for tracking alerts and delivery estimations.</p>
                </div>
              </div>

              {/* Delivery info */}
              <div className="bg-white rounded-2xl p-6 border border-zinc-150 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal pb-2 border-b border-zinc-50">
                  2. Shipping Address
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 block">First Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Ananya"
                      value={address.firstName}
                      onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 block">Last Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Sharma"
                      value={address.lastName}
                      onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 block">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Bandra West Apt 4B, Linking Road"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 block">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Mumbai"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 block">Country</label>
                    <select
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-2.5 py-2 rounded-lg focus:outline-none bg-white uppercase text-[9px] tracking-wider font-bold"
                    >
                      <option value="United States">United States</option>
                      <option value="India">India</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 block">ZIP Code</label>
                    <input
                      type="text"
                      required
                      placeholder="400050"
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                      className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 block">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Shipping method */}
              <div className="bg-white rounded-2xl p-6 border border-zinc-150 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal pb-2 border-b border-zinc-50">
                  3. Shipping Speeds
                </h3>

                <div className="space-y-3 text-xs">
                  <label className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                    shippingMethod === "standard" ? "border-luxury-gold bg-luxury-champagne/15" : "border-zinc-200 hover:border-zinc-300"
                  }`}>
                    <div className="flex gap-3">
                      <input
                        type="radio"
                        name="shippingSpeed"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        className="text-luxury-gold focus:ring-luxury-gold"
                      />
                      <div>
                        <p className="font-bold text-luxury-charcoal uppercase tracking-wider">Standard Delivery</p>
                        <p className="text-[10px] text-zinc-500 normal-case mt-0.5">Estimated 3-5 business days delivery</p>
                      </div>
                    </div>
                    <span className="font-bold text-luxury-gold-dark">
                      {subtotal >= freeShippingThreshold ? "FREE" : "Rs. 150"}
                    </span>
                  </label>

                  <label className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                    shippingMethod === "express" ? "border-luxury-gold bg-luxury-champagne/15" : "border-zinc-200 hover:border-zinc-300"
                  }`}>
                    <div className="flex gap-3">
                      <input
                        type="radio"
                        name="shippingSpeed"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                        className="text-luxury-gold focus:ring-luxury-gold"
                      />
                      <div>
                        <p className="font-bold text-luxury-charcoal uppercase tracking-wider">Priority Express Processing</p>
                        <p className="text-[10px] text-zinc-500 normal-case mt-0.5">Estimated 2-3 business days delivery</p>
                      </div>
                    </div>
                    <span className="font-bold text-luxury-gold-dark">
                      Rs. {(subtotal >= freeShippingThreshold ? 0 : 150) + 150}
                    </span>
                  </label>
                </div>
              </div>

              {/* Payment selection */}
              <div className="bg-white rounded-2xl p-6 border border-zinc-150 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal pb-2 border-b border-zinc-50">
                  4. Secure Payment Portal
                </h3>

                <div className="grid grid-cols-1 gap-3 text-[10px] font-bold uppercase tracking-widest">
                  {[
                    { id: "razorpay", label: "Razorpay" }
                  ].map((pay) => (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setPaymentMethod(pay.id as any)}
                      className={`p-3 border rounded-xl text-center transition ${
                        paymentMethod === pay.id
                          ? "border-luxury-gold bg-luxury-gold text-white"
                          : "border-zinc-200 hover:border-zinc-400 text-zinc-650"
                      }`}
                    >
                      {pay.label}
                    </button>
                  ))}
                </div>

                {/* Razorpay UPI/Netbanking Details */}
                {paymentMethod === "razorpay" && (
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/50 text-xs text-zinc-500 normal-case leading-relaxed animate-fade-in">
                    ⚡ <strong>Razorpay Instant Checkout:</strong> Checking this option redirects to a UPI / Netbanking interface (simulated overlay) on order submission. Supports GPay, PhonePe, Paytm, and Netbanking.
                  </div>
                )}
              </div>

            </div>

            {/* Right Column Summary pane */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-zinc-150 shadow-2xs space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal pb-2 border-b border-zinc-50 flex items-center gap-1.5">
                  <ShoppingBag size={14} /> Shopping Bag Review
                </h3>

                {/* Items List */}
                <div className="divide-y divide-zinc-100 max-h-60 overflow-y-auto no-scrollbar">
                  {cart.map((item) => (
                    <div key={item.sku} className="py-3 flex gap-3 first:pt-0 last:pb-0 text-xs">
                      <img src={item.image} alt="" className="w-12 h-16 object-cover rounded bg-zinc-50 border border-zinc-100 flex-shrink-0" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between font-bold">
                            <span className="line-clamp-1">{item.productName}</span>
                            <span>Rs. {(item.salePrice || item.price) * item.quantity}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            Size/Color: {item.selectedColor} | Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals */}
                <div className="border-t border-zinc-100 pt-4 space-y-2 text-xs font-semibold">
                  <div className="flex justify-between text-zinc-500 font-medium">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Tag size={13} /> Coupon Code: {appliedCoupon}
                      </span>
                      <span>-Rs. {discountValue.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500 font-medium">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "FREE" : `Rs. ${shippingCost}`}</span>
                  </div>
                  {expressCost > 0 && (
                    <div className="flex justify-between text-zinc-500 font-medium">
                      <span>Express Shipping Premium</span>
                      <span>+Rs. {expressCost}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-luxury-charcoal pt-3 border-t border-zinc-200">
                    <span>Total (INR)</span>
                    <span>Rs. {grandTotal}</span>
                  </div>
                </div>

                {/* Coupon Entry */}
                <div className="border-t border-zinc-100 pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="DISCOUNT CODE (e.g. SAMM10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border border-zinc-200 focus:border-luxury-gold px-3 py-2 text-xs rounded-lg focus:outline-none uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 border border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white text-[10px] uppercase font-bold tracking-wider rounded-lg transition"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-red-500 font-medium mt-1.5">{couponError}</p>}
                  {appliedCoupon && <p className="text-[10px] text-green-600 font-medium mt-1.5">Coupon {appliedCoupon} Applied successfully (-10%)!</p>}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 py-4 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-xs uppercase font-bold tracking-widest rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                  >
                    Place Secure Order (Rs. {grandTotal})
                  </button>
                </div>

              </div>

              <div className="bg-luxury-nude p-4 rounded-xl border border-luxury-nude-dark text-[10px] text-zinc-500 text-center space-y-1">
                <p className="font-bold text-luxury-charcoal uppercase tracking-widest">🔒 SSL Encrypted Checkout</p>
                <p className="normal-case leading-relaxed">Your credit card parameters and personal details are encrypted. Payment processors Stripe and Razorpay are simulated in sandboxed secure mode.</p>
              </div>

            </div>

          </form>
        </div>
      )}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
