"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Calendar, Clock, MapPin, CheckCircle, Video, Store, MessageSquare, ArrowRight } from "lucide-react";

export const ConsultationBooking: React.FC = () => {
  const { addBooking } = useApp();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [selectedLocation, setSelectedLocation] = useState<"virtual" | "mumbai" | "delhi" | "bangalore">("virtual");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState("");

  const TIME_SLOTS = [
    "10:00 AM - 10:30 AM",
    "11:00 AM - 11:30 AM",
    "12:00 PM - 12:30 PM",
    "02:00 PM - 02:30 PM",
    "03:00 PM - 03:30 PM",
    "04:00 PM - 04:30 PM",
    "05:00 PM - 05:30 PM"
  ];

  // Helper to generate next 7 days dates for calendar selection
  const getNextDays = () => {
    const days = [];
    const options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        isoString: d.toISOString().split("T")[0],
        formatted: d.toLocaleDateString("en-US", options)
      });
    }
    return days;
  };

  const dates = getNextDays();

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !selectedDate || !selectedTime) {
      alert("Please fill out all fields and select a date & time slot.");
      return;
    }

    const booking = await addBooking({
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      date: selectedDate,
      timeSlot: selectedTime,
      location: selectedLocation,
      notes: formData.notes
    });

    if (booking) {
      setConfirmedBookingId(booking.id);
      setIsConfirmed(true);
    } else {
      alert("Failed to confirm booking. Please try again.");
    }

    // Reset inputs
    setFormData({ name: "", email: "", phone: "", notes: "" });
    setSelectedDate("");
    setSelectedTime("");
  };

  const getAddress = () => {
    switch (selectedLocation) {
      case "mumbai": return "Bandra West Salon, Linking Road, Mumbai, MH";
      case "delhi": return "GK-1 Main Market, New Delhi, DL";
      case "bangalore": return "Indiranagar 100 Ft Rd, Bangalore, KA";
      default: return "WhatsApp Video Call link will be sent via SMS/Email";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-100 shadow-md p-6 sm:p-10 max-w-4xl mx-auto font-sans">
      
      {isConfirmed ? (
        <div className="text-center py-10 space-y-6 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-150">
            <CheckCircle size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-charcoal tracking-wide">
              Stylist Session Confirmed!
            </h4>
            <p className="text-xs text-zinc-500 normal-case leading-relaxed">
              Your luxury hair consultation booking is locked. We've sent details to your email and simulated a confirmation ping on WhatsApp!
            </p>
          </div>

          <div className="bg-luxury-nude p-5 rounded-2xl border border-luxury-nude-dark text-left space-y-3.5 text-xs">
            <div className="flex items-center gap-3 text-luxury-charcoal">
              <Calendar size={15} className="text-luxury-gold-dark" />
              <span><strong>Date:</strong> {dates.find((d) => d.isoString === selectedDate)?.formatted || selectedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-luxury-charcoal">
              <Clock size={15} className="text-luxury-gold-dark" />
              <span><strong>Time:</strong> {selectedTime}</span>
            </div>
            <div className="flex items-center gap-3 text-luxury-charcoal">
              {selectedLocation === "virtual" ? (
                <Video size={15} className="text-luxury-gold-dark" />
              ) : (
                <MapPin size={15} className="text-luxury-gold-dark" />
              )}
              <span><strong>Location:</strong> {selectedLocation.toUpperCase()} ({getAddress()})</span>
            </div>
            <div className="text-[10px] text-zinc-400 border-t border-luxury-nude-dark pt-3 text-center uppercase tracking-widest font-semibold">
              Booking Ref: {confirmedBookingId}
            </div>
          </div>

          <button
            onClick={() => setIsConfirmed(false)}
            className="px-6 py-3 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 shadow-xs"
          >
            Book Another Consultation
          </button>
        </div>
      ) : (
        <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel selectors */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-luxury-charcoal tracking-wide">
                Book a Luxury Styling Consultation
              </h4>
              <p className="text-xs text-zinc-500 normal-case">
                Consult with our master hair restoration specialists to choose base densities, matches, and lengths.
              </p>
            </div>

            {/* Type selector */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
                1. Select Consultation Type
              </span>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedLocation("virtual")}
                  className={`p-4 border rounded-xl flex items-center gap-3 text-left transition duration-200 ${
                    selectedLocation === "virtual"
                      ? "border-luxury-gold bg-luxury-champagne/15"
                      : "border-zinc-200 hover:border-zinc-300 bg-white"
                  }`}
                >
                  <Video size={20} className={selectedLocation === "virtual" ? "text-luxury-gold-dark" : "text-zinc-400"} />
                  <div>
                    <p className="text-xs font-bold text-luxury-charcoal uppercase tracking-wider">Virtual Call</p>
                    <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 normal-case">Video Match / WhatsApp</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLocation("mumbai")}
                  className={`p-4 border rounded-xl flex items-center gap-3 text-left transition duration-200 ${
                    selectedLocation !== "virtual"
                      ? "border-luxury-gold bg-luxury-champagne/15"
                      : "border-zinc-200 hover:border-zinc-300 bg-white"
                  }`}
                >
                  <Store size={20} className={selectedLocation !== "virtual" ? "text-luxury-gold-dark" : "text-zinc-400"} />
                  <div>
                    <p className="text-xs font-bold text-luxury-charcoal uppercase tracking-wider">Studio Salon</p>
                    <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 normal-case">In-Person Try & Blending</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Location selector detailed if Studio Salon */}
            {selectedLocation !== "virtual" && (
              <div className="space-y-2 animate-fade-in">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
                  Select Studio Location
                </span>
                <div className="flex gap-2.5">
                  {(["mumbai", "delhi", "bangalore"] as const).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setSelectedLocation(loc)}
                      className={`px-3 py-2 border rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                        selectedLocation === loc
                          ? "border-luxury-charcoal bg-luxury-charcoal text-white"
                          : "border-zinc-200 hover:border-zinc-400 text-zinc-600"
                      }`}
                    >
                      {loc} Studio
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-400 italic mt-1">
                  📍 Address: {getAddress()}
                </p>
              </div>
            )}

            {/* Date Grid selector */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
                2. Select Date
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                {dates.map((d) => (
                  <button
                    key={d.isoString}
                    type="button"
                    onClick={() => setSelectedDate(d.isoString)}
                    className={`flex flex-col items-center justify-center p-3 border rounded-xl min-w-[70px] transition text-center select-none ${
                      selectedDate === d.isoString
                        ? "border-luxury-gold bg-luxury-gold text-white font-bold"
                        : "border-zinc-200 hover:border-zinc-400 text-zinc-600 bg-white"
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider opacity-80">
                      {d.formatted.split(" ")[0]}
                    </span>
                    <span className="text-sm font-semibold tracking-normal mt-1">
                      {d.formatted.split(" ")[1]}
                    </span>
                    <span className="text-[8px] uppercase tracking-widest opacity-60 mt-0.5">
                      {d.formatted.split(" ")[2]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time slot selector */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
                3. Select Time Slot
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={`py-2 px-2 border rounded-lg text-[10px] font-medium tracking-wide transition text-center ${
                      selectedTime === t
                        ? "border-luxury-charcoal bg-luxury-charcoal text-white font-bold"
                        : "border-zinc-200 hover:border-zinc-400 text-zinc-650 bg-white"
                    }`}
                  >
                    {t.split(" - ")[0]}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right panel Contact Info Form */}
          <div className="lg:col-span-5 bg-luxury-nude rounded-2xl p-6 border border-luxury-nude-dark flex flex-col justify-between space-y-4">
            
            <div className="space-y-4">
              <h5 className="font-serif text-sm font-bold text-luxury-charcoal uppercase tracking-wider pb-2 border-b border-luxury-nude-dark">
                Customer Details
              </h5>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 block">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-zinc-200 focus:border-luxury-gold px-3 py-2 text-xs rounded-md focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 block">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-zinc-200 focus:border-luxury-gold px-3 py-2 text-xs rounded-md focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 block">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-zinc-200 focus:border-luxury-gold px-3 py-2 text-xs rounded-md focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 block">Styling Notes (Optional)</label>
                  <textarea
                    placeholder="Describe your hair concerns, color matches or thinning patterns..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white border border-zinc-200 focus:border-luxury-gold px-3 py-2 text-xs rounded-md focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-3.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Confirm Appointment Slot <ArrowRight size={12} />
              </button>
              <p className="text-[9px] text-center text-zinc-400 mt-2 italic leading-tight">
                🔒 Free Cancellation up to 2 hours before the scheduled time.
              </p>
            </div>

          </div>

        </form>
      )}

    </div>
  );
};
export default ConsultationBooking;
