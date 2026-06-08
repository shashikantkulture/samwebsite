"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Booking, Review, Product } from "../types";
import { MOCK_REVIEWS, MOCK_PRODUCTS } from "../data/mockDb";

interface HomepageSettings {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  categoryJumpsuitsImage: string;
  categoryGownsImage: string;
  categoryAccessoriesImage: string;
  influencer1Image: string;
  influencer1Name: string;
  influencer1Text: string;
  influencer2Image: string;
  influencer2Name: string;
  influencer2Text: string;
}

interface AppContextType {
  wishlist: string[]; // array of product ids
  toggleWishlist: (productId: string) => void;
  recentlyViewed: string[]; // array of product ids
  addToRecentlyViewed: (productId: string) => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "createdAt" | "status">) => Promise<Booking | undefined>;
  cancelBooking: (id: string) => Promise<void>;
  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "date" | "helpfulCount">) => Promise<void>;
  moderateReview: (id: string, action: "approve" | "reject") => Promise<void>;
  incrementReviewHelpful: (id: string) => void;
  exitIntentShown: boolean;
  setExitIntentShown: (shown: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "rating" | "reviewCount">) => Promise<Product | undefined>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  homepageSettings: HomepageSettings | null;
  updateHomepageSettings: (settings: Partial<HomepageSettings>) => Promise<boolean>;
  refreshBookings: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [exitIntentShown, setExitIntentShown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings | null>(null);

  // Load from APIs and LocalStorage (wishlist/recent)
  useEffect(() => {
    // Wishlist (Client-only preference, okay for LocalStorage)
    const savedWish = localStorage.getItem("luxury_wishlist");
    if (savedWish) {
      try { setWishlist(JSON.parse(savedWish)); } catch (e) { console.error(e); }
    }
    // Recently viewed (Client-only preference, okay for LocalStorage)
    const savedRecent = localStorage.getItem("luxury_recently_viewed");
    if (savedRecent) {
      try { setRecentlyViewed(JSON.parse(savedRecent)); } catch (e) { console.error(e); }
    }

    // Fetch Products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          const safeParseJson = (val: any, fallback: any) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
              try { return JSON.parse(val); } catch { return fallback; }
            }
            return fallback;
          };
          const parsed = data.products.map((p: any) => ({
            ...p,
            images: safeParseJson(p.images, []),
            variantOptions: safeParseJson(p.variantOptions, []),
            variants: safeParseJson(p.variants, []),
            solutions: safeParseJson(p.solutions, []),
            detailsList: safeParseJson(p.detailsList, []),
            careInstructions: safeParseJson(p.careInstructions, []),
            specifications: safeParseJson(p.specifications, {}),
            tags: safeParseJson(p.tags, []),
          }));
          setProducts(parsed);
        }
      })
      .catch((e) => console.error("Error fetching products:", e));

    // Fetch Reviews
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) setReviews(data.reviews);
      })
      .catch((e) => console.error("Error fetching reviews:", e));

    // Fetch Homepage Settings
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setHomepageSettings(data.settings);
      })
      .catch((e) => console.error("Error fetching homepage settings:", e));

    // Fetch Bookings
    refreshBookings();
  }, []);

  const refreshBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (e) {
      console.error("Error fetching bookings:", e);
    }
  };

  const toggleWishlist = (productId: string) => {
    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    localStorage.setItem("luxury_wishlist", JSON.stringify(updated));
  };

  const addToRecentlyViewed = (productId: string) => {
    const filtered = recentlyViewed.filter((id) => id !== productId);
    const updated = [productId, ...filtered].slice(0, 6);
    setRecentlyViewed(updated);
    localStorage.setItem("luxury_recently_viewed", JSON.stringify(updated));
  };

  const addBooking = async (bookingInput: Omit<Booking, "id" | "createdAt" | "status">) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingInput),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => [data.booking, ...prev]);
        return data.booking;
      }
    } catch (e) {
      console.error("Add booking error:", e);
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
        );
      }
    } catch (e) {
      console.error("Cancel booking error:", e);
    }
  };

  const addReview = async (reviewInput: Omit<Review, "id" | "date" | "helpfulCount">) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewInput),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => [data.review, ...prev]);
      }
    } catch (e) {
      console.error("Add review error:", e);
    }
  };

  const moderateReview = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === "reject") {
          setReviews((prev) => prev.filter((r) => r.id !== id));
        }
      }
    } catch (e) {
      console.error("Moderate review error:", e);
    }
  };

  const incrementReviewHelpful = (id: string) => {
    const updated = reviews.map((r) => r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r);
    setReviews(updated);
    // Locally incremented; in production, this could call an endpoint.
  };

  const addProduct = async (pInput: Omit<Product, "id" | "rating" | "reviewCount">) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pInput),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => [...prev, data.product]);
        return data.product;
      }
    } catch (e) {
      console.error("Add product error:", e);
    }
  };

  const updateProduct = async (updatedProd: Product) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProd),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === updatedProd.id ? data.product : p))
        );
      }
    } catch (e) {
      console.error("Update product error:", e);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error("Delete product error:", e);
    }
  };

  const updateHomepageSettings = async (newSettings: Partial<HomepageSettings>) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (data.success) {
        setHomepageSettings(data.settings);
        return true;
      }
    } catch (e) {
      console.error("Update settings error:", e);
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        recentlyViewed,
        addToRecentlyViewed,
        bookings,
        addBooking,
        cancelBooking,
        reviews,
        addReview,
        moderateReview,
        incrementReviewHelpful,
        exitIntentShown,
        setExitIntentShown,
        searchQuery,
        setSearchQuery,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        homepageSettings,
        updateHomepageSettings,
        refreshBookings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
