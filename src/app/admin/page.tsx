"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  ShoppingBag, 
  Calendar, 
  Check, 
  Trash2, 
  Edit, 
  Star, 
  RefreshCw, 
  Plus, 
  Trash, 
  PlusCircle, 
  LayoutDashboard, 
  Boxes, 
  FilePlus, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  User, 
  DollarSign, 
  Percent,
  Play,
  Settings
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Context & Types
import { useApp } from "../../context/AppContext";
import { Product, CartItem, VariantCombo, VariantOption } from "../../types";

export default function AdminCMS() {
  const { 
    bookings, 
    cancelBooking, 
    reviews, 
    moderateReview,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    homepageSettings,
    updateHomepageSettings,
  } = useApp();

  // Admin Verification State
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");

  // Navigation state (WordPress-style Sidebar Routing tabs)
  // 'dashboard' | 'products' | 'add-product' | 'orders' | 'appointments' | 'reviews' | 'homepage'
  const [activeTab, setActiveTab] = useState("dashboard");

  // Core CMS Statistics states
  const [salesRevenue, setSalesRevenue] = useState(0);
  const [ordersList, setOrdersList] = useState<any[]>([]);

  // Expanded details tracking
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");

  // Product Editor Form states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<"gowns" | "jumpsuits" | "dresses" | "coords" | "tops" | "accessories" | "bodycon" | "bottomwear" | "mididress" | "onepiece" | "skirts" | "topwear">("jumpsuits");
  const [formPrice, setFormPrice] = useState("");
  const [formSalePrice, setFormSalePrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [newImageInput, setNewImageInput] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formHowToUseVideo, setFormHowToUseVideo] = useState("");
  const [formSolutions, setFormSolutions] = useState<string[]>([]);
  const [formDetailsList, setFormDetailsList] = useState<string[]>([]);
  const [newDetailInput, setNewDetailInput] = useState("");
  const [formCareInstructions, setFormCareInstructions] = useState<string[]>([]);
  const [newCareInput, setNewCareInput] = useState("");

  // Option combinations state (Cartesian variant building)
  const [option1Name, setOption1Name] = useState("Color");
  const [option1Values, setOption1Values] = useState("maroon, blue");
  const [option2Name, setOption2Name] = useState("Size");
  const [option2Values, setOption2Values] = useState("S, M, L");
  const [formVariants, setFormVariants] = useState<VariantCombo[]>([]);

  // Homepage Settings Form States
  const [homeHeroImage, setHomeHeroImage] = useState("");
  const [homeHeroTitle, setHomeHeroTitle] = useState("");
  const [homeHeroSubtitle, setHomeHeroSubtitle] = useState("");
  const [homeCatJumpsuits, setHomeCatJumpsuits] = useState("");
  const [homeCatGowns, setHomeCatGowns] = useState("");
  const [homeCatAccessories, setHomeCatAccessories] = useState("");
  const [homeInf1Image, setHomeInf1Image] = useState("");
  const [homeInf1Name, setHomeInf1Name] = useState("");
  const [homeInf1Text, setHomeInf1Text] = useState("");
  const [homeInf2Image, setHomeInf2Image] = useState("");
  const [homeInf2Name, setHomeInf2Name] = useState("");
  const [homeInf2Text, setHomeInf2Text] = useState("");
  
  const [uploadingState, setUploadingState] = useState(false);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  // Check if current user is an admin on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user && data.user.role === "admin") {
          setIsAdminVerified(true);
        } else {
          window.location.href = "/";
        }
      })
      .catch((e) => {
        console.error("Admin verification fetch failed:", e);
        window.location.href = "/";
      });
  }, []);

  // Fetch orders from database when admin is verified
  useEffect(() => {
    if (!isAdminVerified) return;

    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) {
          setOrdersList(data.orders);
          const totalRev = data.orders.reduce((sum: number, o: any) => sum + parseFloat(o.total || "0"), 0);
          setSalesRevenue(totalRev);
        }
      })
      .catch((e) => console.error("Error loading admin orders:", e));
  }, [isAdminVerified]);

  // Sync homepage settings states when they are loaded in AppContext
  useEffect(() => {
    if (homepageSettings) {
      setHomeHeroImage(homepageSettings.heroImage || "");
      setHomeHeroTitle(homepageSettings.heroTitle || "");
      setHomeHeroSubtitle(homepageSettings.heroSubtitle || "");
      setHomeCatJumpsuits(homepageSettings.categoryJumpsuitsImage || "");
      setHomeCatGowns(homepageSettings.categoryGownsImage || "");
      setHomeCatAccessories(homepageSettings.categoryAccessoriesImage || "");
      setHomeInf1Image(homepageSettings.influencer1Image || "");
      setHomeInf1Name(homepageSettings.influencer1Name || "");
      setHomeInf1Text(homepageSettings.influencer1Text || "");
      setHomeInf2Image(homepageSettings.influencer2Image || "");
      setHomeInf2Name(homepageSettings.influencer2Name || "");
      setHomeInf2Text(homepageSettings.influencer2Text || "");
    }
  }, [homepageSettings]);

  // Admin login action
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword, rememberMe: true }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.user.role === "admin") {
          setIsAdminVerified(true);
          setAdminLoginError("");
        } else {
          setAdminLoginError("Access denied. Admin role required.");
        }
      } else {
        setAdminLoginError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setAdminLoginError("Connection error. Please try again.");
    }
  };

  // Generic file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const formData = new FormData();
    formData.append("file", file);

    setUploadingState(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setter(data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image file");
    } finally {
      setUploadingState(false);
      e.target.value = "";
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const formData = new FormData();
    formData.append("file", file);

    setUploadingState(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormImages((prev) => [...prev, data.url]);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image file");
    } finally {
      setUploadingState(false);
      e.target.value = "";
    }
  };

  const handleSaveHomepageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSettingsSuccess(false);

    const success = await updateHomepageSettings({
      heroImage: homeHeroImage,
      heroTitle: homeHeroTitle,
      heroSubtitle: homeHeroSubtitle,
      categoryJumpsuitsImage: homeCatJumpsuits,
      categoryGownsImage: homeCatGowns,
      categoryAccessoriesImage: homeCatAccessories,
      influencer1Image: homeInf1Image,
      influencer1Name: homeInf1Name,
      influencer1Text: homeInf1Text,
      influencer2Image: homeInf2Image,
      influencer2Name: homeInf2Name,
      influencer2Text: homeInf2Text,
    });

    if (success) {
      setSaveSettingsSuccess(true);
      setTimeout(() => setSaveSettingsSuccess(false), 3000);
    } else {
      alert("Failed to save homepage settings.");
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrdersList((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert(data.error || "Failed to update order status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order status");
    }
  };


  // Cartesian generator for product size/color variants
  const handleGenerateVariants = () => {
    const colorValues = option1Values.split(",").map(v => v.trim()).filter(v => v !== "");
    const sizeValues = option2Values.split(",").map(v => v.trim()).filter(v => v !== "");

    if (colorValues.length === 0) colorValues.push("Default");
    if (sizeValues.length === 0) sizeValues.push("Standard");

    const newVariants: VariantCombo[] = [];

    colorValues.forEach((c) => {
      sizeValues.forEach((s) => {
        const skuPrefix = formName ? formName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 12) : "prod";
        newVariants.push({
          color: c,
          length: s,
          price: Number(formPrice) || 4999,
          salePrice: formSalePrice ? Number(formSalePrice) : undefined,
          sku: `SR-${skuPrefix}-${c.slice(0, 3).toLowerCase()}-${s.slice(0, 3).toLowerCase()}`,
          stock: 15
        });
      });
    });

    setFormVariants(newVariants);
  };

  // Adjust stock, price or SKU of generated variants inside table
  const updateVariantField = (index: number, key: keyof VariantCombo, value: any) => {
    const updated = [...formVariants];
    updated[index] = { ...updated[index], [key]: value };
    setFormVariants(updated);
  };

  // Dynamic bullet lists modifiers
  const addBulletDetail = () => {
    if (newDetailInput.trim()) {
      setFormDetailsList([...formDetailsList, newDetailInput.trim()]);
      setNewDetailInput("");
    }
  };
  const removeBulletDetail = (idx: number) => {
    setFormDetailsList(formDetailsList.filter((_, i) => i !== idx));
  };

  const addCareInstruction = () => {
    if (newCareInput.trim()) {
      setFormCareInstructions([...formCareInstructions, newCareInput.trim()]);
      setNewCareInput("");
    }
  };
  const removeCareInstruction = (idx: number) => {
    setFormCareInstructions(formCareInstructions.filter((_, i) => i !== idx));
  };

  // Image attachments actions
  const addImageField = () => {
    if (newImageInput.trim() && !formImages.includes(newImageInput.trim())) {
      setFormImages([...formImages, newImageInput.trim()]);
      setNewImageInput("");
    }
  };
  const removeImageField = (url: string) => {
    setFormImages(formImages.filter((img) => img !== url));
  };

  // Toggles solution selection
  const handleSolutionToggle = (solution: string) => {
    if (formSolutions.includes(solution)) {
      setFormSolutions(formSolutions.filter(s => s !== solution));
    } else {
      setFormSolutions([...formSolutions, solution]);
    }
  };

  // Clean form variables
  const clearProductForm = () => {
    setEditingProductId(null);
    setFormName("");
    setFormCategory("jumpsuits");
    setFormPrice("");
    setFormSalePrice("");
    setFormDescription("");
    setFormImages([]);
    setNewImageInput("");
    setFormVideoUrl("");
    setFormHowToUseVideo("");
    setFormSolutions([]);
    setFormDetailsList(["Authentic premium styling", "Tailored designer fit", "Premium selected textiles"]);
    setFormCareInstructions(["Dry clean recommended", "Store in garment bags"]);
    setOption1Name("Color");
    setOption1Values("maroon, blue");
    setOption2Name("Size");
    setOption2Values("S, M, L");
    setFormVariants([]);
  };

  // Trigger Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      alert("Name and Price are mandatory parameters!");
      return;
    }

    const slugStr = formName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const priceNum = Number(formPrice);
    const salePriceNum = formSalePrice ? Number(formSalePrice) : undefined;
    const finalImgs = formImages.length > 0 ? formImages : ["https://cdn.shopify.com/s/files/1/0932/4796/3414/files/PRELIMENARY-34.png?v=1771478209"];
    
    // Auto-generate a default single variant combo if none exist
    const finalVariants = formVariants.length > 0 ? formVariants : [
      {
        color: "maroon",
        length: "Standard",
        price: priceNum,
        salePrice: salePriceNum,
        sku: `SR-${slugStr.slice(0, 15)}-default`,
        stock: 15
      }
    ];

    const stockStatusValue = finalVariants.some(v => v.stock > 0) ? "in_stock" : "out_of_stock";

    const variantOptionsPayload: VariantOption[] = [];
    const val1 = option1Values.split(",").map(v => v.trim()).filter(v => v !== "");
    const val2 = option2Values.split(",").map(v => v.trim()).filter(v => v !== "");

    if (val1.length > 0) {
      variantOptionsPayload.push({ name: option1Name, values: val1 });
    }
    if (val2.length > 0) {
      variantOptionsPayload.push({ name: option2Name, values: val2 });
    }

    const productPayload = {
      name: formName,
      slug: slugStr,
      category: formCategory,
      solutions: formSolutions.length > 0 ? formSolutions : ["partywear"],
      price: priceNum,
      salePrice: salePriceNum,
      images: finalImgs,
      videoUrl: formVideoUrl || undefined,
      howToUseVideo: formHowToUseVideo || undefined,
      variantOptions: variantOptionsPayload,
      variants: finalVariants,
      stockStatus: stockStatusValue as any,
      description: formDescription,
      detailsList: formDetailsList,
      careInstructions: formCareInstructions,
      isNew: true,
      isBestseller: false
    };

    if (editingProductId) {
      updateProduct({
        ...productPayload,
        id: editingProductId,
        rating: 4.8,
        reviewCount: 30
      });
      alert(`Product "${formName}" updated successfully.`);
    } else {
      addProduct(productPayload);
      alert(`Product "${formName}" created successfully.`);
    }

    clearProductForm();
    setActiveTab("products");
  };

  // Fill forms with existing product details for updates
  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormPrice(product.price.toString());
    setFormSalePrice(product.salePrice ? product.salePrice.toString() : "");
    setFormDescription(product.description);
    setFormImages(product.images);
    setFormVideoUrl(product.videoUrl || "");
    setFormHowToUseVideo(product.howToUseVideo || "");
    setFormSolutions(product.solutions);
    setFormDetailsList(product.detailsList || []);
    setFormCareInstructions(product.careInstructions || []);
    
    // Parse options
    const opt1 = product.variantOptions[0];
    const opt2 = product.variantOptions[1];
    setOption1Name(opt1 ? opt1.name : "Color");
    setOption1Values(opt1 ? opt1.values.join(", ") : "");
    setOption2Name(opt2 ? opt2.name : "Size");
    setOption2Values(opt2 ? opt2.values.join(", ") : "");

    setFormVariants(product.variants);
    setActiveTab("add-product");
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete product "${productName}"?`)) {
      deleteProduct(productId);
      alert(`Product "${productName}" has been removed.`);
    }
  };

  const handleModerateReview = (id: string, action: "approve" | "reject") => {
    moderateReview(id, action);
    alert(`Review ${action === "approve" ? "Approved" : "Hidden"} successfully.`);
  };

  const filteredProducts = products.filter((p) => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (!isAdminVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans text-xs uppercase tracking-widest text-zinc-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold mb-2"></div>
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0f1] font-sans flex flex-col md:flex-row antialiased select-none">
      
      {/* 1. WordPress Sidebar Navigation Panel */}
      <aside className="w-full md:w-64 bg-[#1d2327] text-zinc-300 flex flex-col flex-shrink-0">
        
        {/* W Vibe Admin Branding */}
        <div className="bg-[#101416] py-5 px-6 flex items-center gap-2.5 border-b border-zinc-800">
          <div className="w-8 h-8 rounded bg-luxury-gold flex items-center justify-center font-serif text-luxury-charcoal font-black text-lg">
            W
          </div>
          <div>
            <h1 className="text-white font-serif font-black text-sm uppercase tracking-wider">SAMM WP-Admin</h1>
            <p className="text-[9px] text-luxury-gold uppercase tracking-widest font-bold">Store Manager</p>
          </div>
        </div>

        {/* Sidebar Nav Buttons */}
        <nav className="flex-1 py-4 px-3 space-y-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition ${
              activeTab === "dashboard" ? "bg-[#72aee6] text-white" : "hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <LayoutDashboard size={16} /> Dashboard Overview
          </button>
          
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition ${
              activeTab === "products" ? "bg-[#72aee6] text-white" : "hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Boxes size={16} /> All Products ({products.length})
          </button>

          <button
            onClick={() => { clearProductForm(); setActiveTab("add-product"); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition ${
              activeTab === "add-product" ? "bg-[#72aee6] text-white" : "hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <FilePlus size={16} /> {editingProductId ? "Edit Product" : "Add New Product"}
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition ${
              activeTab === "orders" ? "bg-[#72aee6] text-white" : "hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <ShoppingBag size={16} /> Customer Orders ({ordersList.length})
          </button>

          <button
            onClick={() => setActiveTab("appointments")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition ${
              activeTab === "appointments" ? "bg-[#72aee6] text-white" : "hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Calendar size={16} /> Styling Appointments ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition ${
              activeTab === "reviews" ? "bg-[#72aee6] text-white" : "hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Star size={16} /> Reviews Moderation ({reviews.length})
          </button>

          <button
            onClick={() => setActiveTab("homepage")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition ${
              activeTab === "homepage" ? "bg-[#72aee6] text-white" : "hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Settings size={16} /> Homepage Settings
          </button>
        </nav>

        {/* Exit link */}
        <div className="p-4 border-t border-zinc-800 text-center">
          <Link
            href="/"
            className="inline-block w-full py-2 bg-luxury-gold text-luxury-charcoal text-[10px] uppercase font-bold tracking-widest rounded hover:bg-white transition"
          >
            Visit Live Store &rarr;
          </Link>
        </div>
      </aside>

      {/* 2. Main content wrapper */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header toolbar */}
        <header className="bg-white border-b border-zinc-200 py-4 px-6 flex items-center justify-between shadow-xs select-none">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-400 font-bold uppercase tracking-wider">WordPress CMS Panel v6.5</span>
            <span className="text-zinc-300">•</span>
            <span className="text-green-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live connection
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-luxury-charcoal">
            <Shield size={14} className="text-luxury-gold" /> Secure HTTPS session
          </div>
        </header>

        {/* Dynamic page contents body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto no-scrollbar space-y-6">
          
          {/* TAB: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-300">
                <h2 className="font-serif text-2xl font-black text-luxury-charcoal tracking-wide">
                  Dashboard Dashboard
                </h2>
                <span className="text-xs text-zinc-500 font-medium">Overview of store health</span>
              </div>

              {/* Statistics panels row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">Gross Revenue</span>
                    <p className="text-2xl font-serif font-black text-[#1d2327]">Rs. {salesRevenue.toFixed(2)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">Apparel Products</span>
                    <p className="text-2xl font-serif font-black text-[#1d2327]">{products.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-luxury-champagne text-luxury-gold-dark flex items-center justify-center">
                    <Boxes size={20} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">Customer Orders</span>
                    <p className="text-2xl font-serif font-black text-[#1d2327]">{ordersList.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShoppingBag size={20} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">Styling Bookings</span>
                    <p className="text-2xl font-serif font-black text-[#1d2327]">{bookings.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                </div>
              </div>

              {/* Quick Actions and recent summaries */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* W Welcome & Quick Actions */}
                <div className="lg:col-span-6 bg-[#1d2327] text-white p-6 rounded-xl shadow-sm space-y-4">
                  <h3 className="text-lg font-serif font-semibold text-luxury-gold">Welcome to your WordPress Dashboard!</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Here you can completely control the SAMM Renaissance catalog, manage customer sales, verify delivery details, adjust variant stocks, and configure multimedia showpieces like images and styling video links.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => { clearProductForm(); setActiveTab("add-product"); }}
                      className="px-4 py-2 bg-luxury-gold text-luxury-charcoal rounded text-xs font-bold uppercase tracking-wider hover:bg-white transition"
                    >
                      Add New Product
                    </button>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="px-4 py-2 border border-zinc-500 rounded text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 hover:text-white transition"
                    >
                      View Active Orders
                    </button>
                  </div>
                </div>

                {/* Latest Orders Summary */}
                <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal pb-2 border-b border-zinc-100 flex items-center justify-between">
                    <span>Recent Sales Activities</span>
                    <span className="text-[9px] bg-green-50 text-green-600 font-black px-1.5 py-0.5 rounded">Synced</span>
                  </h3>
                  <div className="space-y-4 divide-y divide-zinc-50">
                    {ordersList.slice(0, 3).map((order) => (
                      <div key={order.orderId} className="pt-3 first:pt-0 flex items-center justify-between text-xs text-luxury-charcoal">
                        <div>
                          <p className="font-bold uppercase">Order {order.orderId}</p>
                          <p className="text-[9px] text-zinc-400 mt-0.5">{order.email} | {order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-luxury-gold-dark">Rs. {order.total}</p>
                          <span className="text-[8px] uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded text-zinc-500 font-bold block mt-1">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: PRODUCTS LIST */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-zinc-300">
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl font-black text-luxury-charcoal tracking-wide flex items-center gap-2">
                    Apparel Catalog
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">Add, modify, or delete items in the store</p>
                </div>
                <button
                  onClick={() => { clearProductForm(); setActiveTab("add-product"); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal rounded text-xs font-bold uppercase tracking-widest transition"
                >
                  <PlusCircle size={15} /> Add New
                </button>
              </div>

              {/* Search filter */}
              <div className="bg-white p-4 rounded-xl border border-zinc-200 flex gap-4">
                <input
                  type="text"
                  placeholder="Search catalog by title, category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="flex-1 text-xs border border-zinc-200 focus:outline-none focus:border-luxury-gold px-3.5 py-2.5 bg-[#fbfbfb] rounded-lg"
                />
              </div>

              {/* Table of products */}
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs text-luxury-charcoal">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 uppercase text-[9px] tracking-widest font-black text-zinc-450">
                      <th className="py-4 px-6">Image</th>
                      <th className="py-4 px-6">Product Title</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Base Price</th>
                      <th className="py-4 px-6">Stock Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-400 uppercase tracking-widest">
                          No matching products found.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                        return (
                          <tr key={p.id} className="hover:bg-zinc-50/50 transition">
                            <td className="py-4 px-6">
                              <img 
                                src={p.images[0]} 
                                alt="" 
                                className="w-10 h-12 object-cover rounded bg-zinc-50 border border-zinc-100 flex-shrink-0"
                              />
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-bold text-sm block">{p.name}</span>
                              <span className="text-[10px] text-zinc-400 block mt-0.5">slug: {p.slug}</span>
                            </td>
                            <td className="py-4 px-6 uppercase tracking-wider text-[10px]">
                              {p.category}
                            </td>
                            <td className="py-4 px-6 font-bold text-luxury-gold-dark text-sm">
                              Rs. {p.price}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-black border ${
                                p.stockStatus === "out_of_stock" ? "bg-red-50 text-red-500 border-red-150" :
                                p.stockStatus === "low_stock" ? "bg-amber-50 text-amber-500 border-amber-150" : "bg-green-50 text-green-500 border-green-150"
                              }`}>
                                {p.stockStatus.replace("_", " ")} ({totalStock} Left)
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right space-x-1">
                              <button
                                onClick={() => handleEditClick(p)}
                                className="p-2 border border-zinc-200 hover:border-luxury-gold rounded-lg hover:bg-amber-50 text-luxury-charcoal transition"
                                aria-label="Edit product"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-2 border border-zinc-200 hover:border-red-500 rounded-lg hover:bg-red-50 text-red-500 transition"
                                aria-label="Delete product"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ADD / EDIT PRODUCT FORM */}
          {activeTab === "add-product" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-300">
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl font-black text-luxury-charcoal tracking-wide">
                    {editingProductId ? `Edit Product: ${formName}` : "Create Apparel Product"}
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">Fill in catalog specifications and variants grid</p>
                </div>
                <button
                  onClick={() => { clearProductForm(); setActiveTab("products"); }}
                  className="px-4 py-2 border border-zinc-300 hover:bg-white text-zinc-500 rounded text-xs font-bold uppercase tracking-wider"
                >
                  Cancel & Exit
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Form parameters */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Basic information */}
                  <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-4 text-xs font-medium">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1d2327] pb-2 border-b border-zinc-100">
                      1. General Details
                    </h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">Product Name / Title</label>
                      <input
                        type="text"
                        required
                        placeholder="Velvet Corset Jumpsuit"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full border border-zinc-200 focus:border-luxury-gold px-3.5 py-2.5 rounded-lg focus:outline-none bg-[#fbfbfb]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">Category</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as any)}
                          className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2.5 rounded-lg focus:outline-none bg-white font-semibold uppercase tracking-wider text-[10px]"
                        >
                          <option value="bodycon">Bodycon</option>
                          <option value="bottomwear">Bottom Wear</option>
                          <option value="coords">Co-ords-set</option>
                          <option value="jumpsuits">Jumpsuit</option>
                          <option value="mididress">Midi-dress</option>
                          <option value="onepiece">One-piece</option>
                          <option value="skirts">Skirts</option>
                          <option value="topwear">Topwear</option>
                          <option value="accessories">Accessories</option>
                          <option value="gowns">Kids Wear</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">Base Price (Rs.)</label>
                        <input
                          type="number"
                          required
                          placeholder="8999"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2.5 rounded-lg focus:outline-none bg-[#fbfbfb]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">Compare Sale Price (Rs.)</label>
                        <input
                          type="number"
                          placeholder="3999"
                          value={formSalePrice}
                          onChange={(e) => setFormSalePrice(e.target.value)}
                          className="w-full border border-zinc-200 focus:border-luxury-gold px-3 py-2.5 rounded-lg focus:outline-none bg-[#fbfbfb]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">Product Editorial Description</label>
                      <textarea
                        rows={5}
                        placeholder="Elevate your evening wardrobe with this printed corset jumpsuit..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full border border-zinc-200 focus:border-luxury-gold px-3.5 py-2.5 rounded-lg focus:outline-none bg-[#fbfbfb] leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Media attachments */}
                  <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-4 text-xs font-medium">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1d2327] pb-2 border-b border-zinc-100 flex items-center justify-between">
                      <span>2. Images & Videos Manager</span>
                      <span className="text-[9px] text-zinc-450 lowercase">Shopify CDN URLs recommended</span>
                    </h3>

                    {/* Image URL adding */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">Attach Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://cdn.shopify.com/s/files/.../img.jpg"
                          value={newImageInput}
                          onChange={(e) => setNewImageInput(e.target.value)}
                          className="flex-1 border border-zinc-200 focus:border-luxury-gold px-3 py-2.5 rounded-lg focus:outline-none bg-[#fbfbfb]"
                        />
                        <button
                          type="button"
                          onClick={addImageField}
                          className="px-4 py-2.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal rounded-lg text-xs uppercase font-bold tracking-wider transition cursor-pointer"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>

                    {/* Image File Uploader */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">Or Upload Local File</label>
                      <div className="flex items-center gap-3 bg-[#fbfbfb] border border-dashed border-zinc-200 rounded-lg p-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProductImageUpload}
                          className="text-xs text-zinc-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-luxury-champagne file:text-luxury-charcoal hover:file:bg-luxury-gold cursor-pointer"
                        />
                        {uploadingState && (
                          <span className="text-[10px] text-luxury-gold-dark font-bold animate-pulse">Uploading file...</span>
                        )}
                      </div>
                    </div>

                    {/* Image Previews list */}
                    {formImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        {formImages.map((url, idx) => (
                          <div key={idx} className="relative aspect-w-3 aspect-h-4 h-32 bg-zinc-50 border border-zinc-100 rounded-lg overflow-hidden flex flex-col group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImageField(url)}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-90 transition shadow"
                              aria-label="Remove image"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Video specifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-100 pt-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">Showcase Video URL</label>
                        <input
                          type="text"
                          placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                          value={formVideoUrl}
                          onChange={(e) => setFormVideoUrl(e.target.value)}
                          className="w-full border border-zinc-200 focus:border-luxury-gold px-3.5 py-2.5 rounded-lg focus:outline-none bg-[#fbfbfb]"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">Instructional/How-To Video URL</label>
                        <input
                          type="text"
                          placeholder="https://www.w3schools.com/html/movie.mp4"
                          value={formHowToUseVideo}
                          onChange={(e) => setFormHowToUseVideo(e.target.value)}
                          className="w-full border border-zinc-200 focus:border-luxury-gold px-3.5 py-2.5 rounded-lg focus:outline-none bg-[#fbfbfb]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom Option Cartesian Variants builder */}
                  <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-6 text-xs font-medium">
                    <div className="border-b border-zinc-100 pb-2 flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#1d2327]">
                        3. WordPress Variant Combinations Builder
                      </h3>
                      <span className="text-[9px] text-[#72aee6] font-bold">Auto-Cartesian Grid</span>
                    </div>

                    {/* Combinations details inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                      
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase font-black text-luxury-charcoal block">Option Parameter 1</span>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-bold text-zinc-400 block">Option Title</label>
                          <input 
                            type="text" 
                            value={option1Name} 
                            onChange={(e) => setOption1Name(e.target.value)} 
                            placeholder="Color"
                            className="w-full border border-zinc-200 px-3 py-2 bg-white rounded-md focus:outline-none focus:border-luxury-gold" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-bold text-zinc-400 block">Comma-separated values</label>
                          <input 
                            type="text" 
                            value={option1Values} 
                            onChange={(e) => setOption1Values(e.target.value)} 
                            placeholder="maroon, blue, golden"
                            className="w-full border border-zinc-200 px-3 py-2 bg-white rounded-md focus:outline-none focus:border-luxury-gold" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3 border-t md:border-t-0 md:border-l border-zinc-200 pt-3 md:pt-0 md:pl-6">
                        <span className="text-[10px] uppercase font-black text-luxury-charcoal block">Option Parameter 2</span>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-bold text-zinc-400 block">Option Title</label>
                          <input 
                            type="text" 
                            value={option2Name} 
                            onChange={(e) => setOption2Name(e.target.value)} 
                            placeholder="Size"
                            className="w-full border border-zinc-200 px-3 py-2 bg-white rounded-md focus:outline-none focus:border-luxury-gold" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-bold text-zinc-400 block">Comma-separated values</label>
                          <input 
                            type="text" 
                            value={option2Values} 
                            onChange={(e) => setOption2Values(e.target.value)} 
                            placeholder="S, M, L, XL"
                            className="w-full border border-zinc-200 px-3 py-2 bg-white rounded-md focus:outline-none focus:border-luxury-gold" 
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 pt-2 text-right">
                        <button
                          type="button"
                          onClick={handleGenerateVariants}
                          className="px-4 py-2 bg-[#72aee6] hover:bg-[#528ebf] text-white rounded text-[10px] uppercase font-bold tracking-widest transition"
                        >
                          Generate Combinations List
                        </button>
                      </div>
                    </div>

                    {/* Variant combinations Grid edit table */}
                    {formVariants.length > 0 && (
                      <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 uppercase text-[8px] font-black text-zinc-450">
                              <th className="py-2.5 px-4">{option1Name}</th>
                              <th className="py-2.5 px-4">{option2Name}</th>
                              <th className="py-2.5 px-4">Price (Rs.)</th>
                              <th className="py-2.5 px-4">Sale Price</th>
                              <th className="py-2.5 px-4">Stock Level</th>
                              <th className="py-2.5 px-4">SKU Code</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 font-semibold bg-white">
                            {formVariants.map((combo, idx) => (
                              <tr key={idx} className="hover:bg-zinc-50/50">
                                <td className="py-2 px-4 text-luxury-charcoal uppercase">{combo.color}</td>
                                <td className="py-2 px-4 text-luxury-charcoal uppercase">{combo.length}</td>
                                <td className="py-2 px-4">
                                  <input 
                                    type="number" 
                                    value={combo.price} 
                                    onChange={(e) => updateVariantField(idx, "price", Number(e.target.value))}
                                    className="w-16 border border-zinc-200 px-1 py-1 rounded bg-[#fbfbfb] text-center" 
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <input 
                                    type="number" 
                                    value={combo.salePrice || ""} 
                                    onChange={(e) => updateVariantField(idx, "salePrice", e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="None"
                                    className="w-16 border border-zinc-200 px-1 py-1 rounded bg-[#fbfbfb] text-center" 
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <input 
                                    type="number" 
                                    value={combo.stock} 
                                    onChange={(e) => updateVariantField(idx, "stock", Number(e.target.value))}
                                    className="w-14 border border-zinc-200 px-1 py-1 rounded bg-[#fbfbfb] text-center" 
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <input 
                                    type="text" 
                                    value={combo.sku} 
                                    onChange={(e) => updateVariantField(idx, "sku", e.target.value)}
                                    className="w-32 border border-zinc-200 px-1.5 py-1 rounded bg-[#fbfbfb] text-[8px]" 
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Taxonomy / Meta fields */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Save action box */}
                  <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-4 text-xs font-semibold">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1d2327] pb-2 border-b border-zinc-100">
                      Publish Settings
                    </h3>
                    <div className="space-y-1.5 text-zinc-500 normal-case font-medium">
                      <p>📋 Status: <strong className="text-luxury-charcoal">Draft / Ready</strong></p>
                      <p>👁️ Visibility: <strong className="text-luxury-charcoal">Public Catalog</strong></p>
                      <p>⚡ Action: <strong className="text-luxury-charcoal">{editingProductId ? "Update Product Record" : "Publish to Storefront"}</strong></p>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 py-3.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal uppercase font-bold tracking-widest rounded-lg transition duration-300 shadow-sm"
                    >
                      <Check size={14} /> {editingProductId ? "Update Catalog Item" : "Publish Catalog Item"}
                    </button>
                  </div>

                  {/* Solution Occasions tags checkboxes */}
                  <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-4 text-xs font-semibold">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1d2327] pb-2 border-b border-zinc-100">
                      Style Occasions Taxonomy
                    </h3>
                    
                    <div className="space-y-2.5 font-medium normal-case text-luxury-charcoal">
                      {[
                        { id: "partywear", label: "Party & Evening Wear" },
                        { id: "casual", label: "Casual Luxury Styles" },
                        { id: "kids", label: "Kids & Toddler Gowns" },
                        { id: "festive", label: "Festive Couture" },
                        { id: "styling", label: "Designer Styling Accents" }
                      ].map((item) => {
                        const isChecked = formSolutions.includes(item.id);
                        return (
                          <label key={item.id} className="flex items-center gap-2.5 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleSolutionToggle(item.id)}
                              className="text-luxury-gold focus:ring-luxury-gold h-4 w-4 border-zinc-300 rounded"
                            />
                            <span>{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bullet Lists: Product specs */}
                  <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-4 text-xs font-semibold">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1d2327] pb-2 border-b border-zinc-100 flex items-center justify-between">
                      <span>Bullets Specs List</span>
                      <span className="text-[8px] text-zinc-400">Features</span>
                    </h3>

                    <div className="space-y-1">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="100% human-grade silk stitching"
                          value={newDetailInput}
                          onChange={(e) => setNewDetailInput(e.target.value)}
                          className="flex-1 border border-zinc-200 px-2 py-1.5 rounded-lg focus:outline-none bg-[#fbfbfb] font-medium"
                        />
                        <button
                          type="button"
                          onClick={addBulletDetail}
                          className="p-2 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-luxury-charcoal rounded-lg"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    <ul className="space-y-1.5 pt-2 text-[10px] text-zinc-650 list-disc pl-4 font-medium normal-case">
                      {formDetailsList.map((detail, idx) => (
                        <li key={idx} className="flex justify-between items-center gap-2">
                          <span className="line-clamp-1">{detail}</span>
                          <button
                            type="button"
                            onClick={() => removeBulletDetail(idx)}
                            className="text-zinc-400 hover:text-red-500 font-bold"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bullet Lists: Care details */}
                  <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs space-y-4 text-xs font-semibold">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1d2327] pb-2 border-b border-zinc-100 flex items-center justify-between">
                      <span>Care Instructions List</span>
                      <span className="text-[8px] text-zinc-400">Fabrics care</span>
                    </h3>

                    <div className="space-y-1">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Wash under 30 degrees cold"
                          value={newCareInput}
                          onChange={(e) => setNewCareInput(e.target.value)}
                          className="flex-1 border border-zinc-200 px-2 py-1.5 rounded-lg focus:outline-none bg-[#fbfbfb] font-medium"
                        />
                        <button
                          type="button"
                          onClick={addCareInstruction}
                          className="p-2 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-luxury-charcoal rounded-lg"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    <ul className="space-y-1.5 pt-2 text-[10px] text-zinc-650 list-disc pl-4 font-medium normal-case">
                      {formCareInstructions.map((care, idx) => (
                        <li key={idx} className="flex justify-between items-center gap-2">
                          <span className="line-clamp-1">{care}</span>
                          <button
                            type="button"
                            onClick={() => removeCareInstruction(idx)}
                            className="text-zinc-400 hover:text-red-500 font-bold"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

              </form>
            </div>
          )}

          {/* TAB: CUSTOMER ORDERS VIEW */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-300">
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl font-black text-luxury-charcoal tracking-wide">
                    WordPress Shop Orders
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">Verify customer parameters, billing totals, and change delivery milestones</p>
                </div>
                <span className="text-xs bg-[#1d2327] text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-widest text-[9px]">
                  Orders Track DB
                </span>
              </div>

              {/* Orders table list */}
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs text-luxury-charcoal">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 uppercase text-[9px] tracking-widest font-black text-zinc-450">
                      <th className="py-4 px-6 w-12">#</th>
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Customer Email</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Total Paid</th>
                      <th className="py-4 px-6 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {ordersList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-400 uppercase tracking-widest">
                          No customer orders recorded yet.
                        </td>
                      </tr>
                    ) : (
                      ordersList.map((order, idx) => {
                        const isExpanded = expandedOrderId === order.orderId;
                        return (
                          <React.Fragment key={order.orderId}>
                            <tr className="hover:bg-zinc-50/50 transition">
                              <td className="py-4 px-6 font-bold text-zinc-400">{idx + 1}</td>
                              <td className="py-4 px-6 font-bold text-sm uppercase">{order.orderId}</td>
                              <td className="py-4 px-6 text-zinc-550">{order.date}</td>
                              <td className="py-4 px-6 text-zinc-550 normal-case">{order.email}</td>
                              <td className="py-4 px-6">
                                <span className={`px-2.5 py-0.5 rounded text-[8px] uppercase tracking-widest font-black border ${
                                  order.status.includes("Delivered") ? "bg-green-50 text-green-600 border-green-150" :
                                  order.status.includes("Cancelled") ? "bg-red-50 text-red-500 border-red-150" :
                                  "bg-amber-50 text-amber-600 border-amber-150 animate-pulse"
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-bold text-luxury-gold-dark text-sm">
                                Rs. {order.total}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button
                                  onClick={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 hover:border-luxury-gold text-luxury-charcoal rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider ml-auto"
                                >
                                  {isExpanded ? "Collapse" : "Expand Details"} 
                                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                              </td>
                            </tr>
                            
                            {/* Expandable Order detail sheet */}
                            {isExpanded && (
                              <tr className="bg-zinc-50/70 border-b border-zinc-200">
                                <td colSpan={7} className="py-6 px-8 space-y-6">
                                  
                                  {/* Details block */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    
                                    {/* Shipping Address panel */}
                                    <div className="space-y-3 bg-white p-4 rounded-xl border border-zinc-150">
                                      <h4 className="text-[10px] uppercase font-black tracking-widest text-[#1d2327] pb-1 border-b border-zinc-100 flex items-center gap-1">
                                        <User size={12} /> Delivery Parameters
                                      </h4>
                                      <div className="space-y-1 text-zinc-650 font-medium text-[11px] normal-case leading-relaxed">
                                        <p><strong>Shipping Address:</strong> {order.address}</p>
                                        <p><strong>Customer Mail:</strong> {order.email}</p>
                                        <p><strong>Secure Gateway:</strong> {order.payment || "STRIPE (Test mode)"}</p>
                                      </div>
                                    </div>

                                    {/* Items Ordered detail */}
                                    <div className="space-y-3 bg-white p-4 rounded-xl border border-zinc-150 md:col-span-2">
                                      <h4 className="text-[10px] uppercase font-black tracking-widest text-[#1d2327] pb-1 border-b border-zinc-100">
                                        Purchased Items
                                      </h4>
                                      
                                      <div className="divide-y divide-zinc-100 max-h-36 overflow-y-auto no-scrollbar font-medium">
                                        {order.items?.map((item: any, i: number) => (
                                          <div key={i} className="py-2 flex items-center justify-between gap-4 text-[11px]">
                                            <div className="flex items-center gap-2">
                                              <img src={item.image} alt="" className="w-8 h-10 object-cover rounded bg-zinc-50 border border-zinc-100" />
                                              <div>
                                                <p className="font-bold text-luxury-charcoal line-clamp-1">{item.productName}</p>
                                                <p className="text-[9px] text-zinc-400 mt-0.5">
                                                  Specs: {item.selectedColor} | Qty: {item.quantity}
                                                </p>
                                              </div>
                                            </div>
                                            <span className="font-bold text-luxury-gold-dark">
                                              Rs. {(item.salePrice || item.price) * item.quantity}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                  </div>

                                  {/* Status settings toolbar */}
                                  <div className="bg-white p-4 rounded-xl border border-zinc-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-semibold">
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Update Status:</span>
                                      <select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                                        className="border border-zinc-250 focus:border-luxury-gold px-3 py-1.5 rounded-lg focus:outline-none bg-white tracking-widest uppercase font-bold text-[9px]"
                                      >
                                        <option value="Processing / Dispatched">Processing / Dispatched</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                      </select>
                                    </div>
                                    <div className="text-[10px] text-zinc-400 italic">
                                      Updating order status logs dynamic changes and triggers state update instantly.
                                    </div>
                                  </div>

                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SCHEDULER APPOINTMENTS LOGS */}
          {activeTab === "appointments" && (
            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-2xs space-y-6 animate-fade-in">
              <div className="border-b border-zinc-100 pb-3 flex justify-between items-center text-xs font-semibold">
                <h3 className="font-serif text-sm font-bold text-luxury-charcoal uppercase tracking-wider">
                  Store Consultation Slots
                </h3>
                <span className="text-zinc-400">{bookings.length} slots active</span>
              </div>

              <div className="divide-y divide-zinc-100 max-h-96 overflow-y-auto no-scrollbar space-y-4 font-semibold text-xs text-luxury-charcoal">
                {bookings.length === 0 ? (
                  <p className="text-center py-6 text-zinc-400 normal-case font-medium">No styling bookings logs yet.</p>
                ) : (
                  bookings.map((b) => (
                    <div key={b.id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm block">{b.customerName}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-black ${
                          b.status === "confirmed" ? "bg-green-50 text-green-600 border border-green-150" : "bg-red-50 text-red-500 border border-red-150"
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      <div className="text-[10px] text-zinc-500 space-y-1 normal-case font-medium leading-tight">
                        <p>🗓️ Date: {b.date} | Time slot: {b.timeSlot}</p>
                        <p>📍 Location type: {b.location.toUpperCase()} | Phone number: {b.phone}</p>
                      </div>

                      {b.status === "confirmed" && (
                        <div className="pt-1 flex gap-2">
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to cancel this booking?")) {
                                cancelBooking(b.id);
                              }
                            }}
                            className="px-3 py-1.5 border border-red-250 hover:bg-red-50 text-red-500 rounded text-[9px] uppercase tracking-wider font-bold transition"
                          >
                            Cancel Slot
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: HOMEPAGE SETTINGS */}
          {activeTab === "homepage" && (
            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-2xs space-y-6 animate-fade-in text-xs font-semibold text-luxury-charcoal">
              <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-luxury-charcoal">
                  Homepage Design & Campaigns
                </h3>
                <span className="text-zinc-450 normal-case font-medium">Modify featured sliders, category icons, and endorsement cards</span>
              </div>

              {saveSettingsSuccess && (
                <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg text-xs font-bold text-center">
                  ✓ Homepage configurations saved successfully!
                </div>
              )}

              <form onSubmit={handleSaveHomepageSettings} className="space-y-6">
                
                {/* 1. Hero Campaign Section */}
                <div className="border border-zinc-150 rounded-xl p-5 space-y-4 bg-zinc-50/30">
                  <h4 className="text-[10px] uppercase tracking-wider text-luxury-gold-dark font-black border-b border-zinc-100 pb-1.5 flex items-center justify-between">
                    <span>1. Main Hero Campaign Banner</span>
                    <span className="text-zinc-400 lowercase font-medium">Shows on page load</span>
                  </h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450">Campaign Background Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://..."
                        value={homeHeroImage}
                        onChange={(e) => setHomeHeroImage(e.target.value)}
                        className="flex-1 border border-zinc-200 px-3 py-2 rounded-lg bg-white"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        id="hero-upload"
                        onChange={(e) => handleFileUpload(e, setHomeHeroImage)}
                        className="hidden"
                      />
                      <label
                        htmlFor="hero-upload"
                        className="px-4 py-2 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center justify-center cursor-pointer transition whitespace-nowrap"
                      >
                        Upload File
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450">Campaign Title Text</label>
                      <input
                        type="text"
                        placeholder="Hero Title"
                        value={homeHeroTitle}
                        onChange={(e) => setHomeHeroTitle(e.target.value)}
                        className="w-full border border-zinc-200 px-3 py-2 rounded-lg bg-white font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450">Campaign Subtitle / Description</label>
                      <textarea
                        placeholder="Hero Description"
                        rows={2}
                        value={homeHeroSubtitle}
                        onChange={(e) => setHomeHeroSubtitle(e.target.value)}
                        className="w-full border border-zinc-200 px-3 py-2 rounded-lg bg-white leading-relaxed font-sans font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Shop Categories Images */}
                <div className="border border-zinc-150 rounded-xl p-5 space-y-4 bg-zinc-50/30">
                  <h4 className="text-[10px] uppercase tracking-wider text-luxury-gold-dark font-black border-b border-zinc-100 pb-1.5 flex items-center justify-between">
                    <span>2. Curated Collections - Category Cover Images</span>
                    <span className="text-zinc-400 lowercase font-medium">Cover blocks for category catalog link cards</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Jumpsuits */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450">Jumpsuits & Co-ords</label>
                      <div className="aspect-w-16 aspect-h-9 h-24 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 mb-2 relative group">
                        <img src={homeCatJumpsuits || "https://placehold.co/300x150"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={homeCatJumpsuits}
                          onChange={(e) => setHomeCatJumpsuits(e.target.value)}
                          className="flex-1 text-[10px] border border-zinc-200 px-2 py-1 rounded bg-white font-medium"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          id="cat-jumpsuits-upload"
                          onChange={(e) => handleFileUpload(e, setHomeCatJumpsuits)}
                          className="hidden"
                        />
                        <label
                          htmlFor="cat-jumpsuits-upload"
                          className="px-2 py-1 bg-luxury-charcoal text-white rounded text-[9px] uppercase tracking-wider cursor-pointer whitespace-nowrap hover:bg-luxury-gold hover:text-luxury-charcoal font-bold transition flex items-center justify-center"
                        >
                          Upload
                        </label>
                      </div>
                    </div>

                    {/* Gowns */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450">Kids Gowns & Tulle</label>
                      <div className="aspect-w-16 aspect-h-9 h-24 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 mb-2 relative group">
                        <img src={homeCatGowns || "https://placehold.co/300x150"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={homeCatGowns}
                          onChange={(e) => setHomeCatGowns(e.target.value)}
                          className="flex-1 text-[10px] border border-zinc-200 px-2 py-1 rounded bg-white font-medium"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          id="cat-gowns-upload"
                          onChange={(e) => handleFileUpload(e, setHomeCatGowns)}
                          className="hidden"
                        />
                        <label
                          htmlFor="cat-gowns-upload"
                          className="px-2 py-1 bg-luxury-charcoal text-white rounded text-[9px] uppercase tracking-wider cursor-pointer whitespace-nowrap hover:bg-luxury-gold hover:text-luxury-charcoal font-bold transition flex items-center justify-center"
                        >
                          Upload
                        </label>
                      </div>
                    </div>

                    {/* Accessories */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450">Luxury Accessories</label>
                      <div className="aspect-w-16 aspect-h-9 h-24 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 mb-2 relative group">
                        <img src={homeCatAccessories || "https://placehold.co/300x150"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={homeCatAccessories}
                          onChange={(e) => setHomeCatAccessories(e.target.value)}
                          className="flex-1 text-[10px] border border-zinc-200 px-2 py-1 rounded bg-white font-medium"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          id="cat-acc-upload"
                          onChange={(e) => handleFileUpload(e, setHomeCatAccessories)}
                          className="hidden"
                        />
                        <label
                          htmlFor="cat-acc-upload"
                          className="px-2 py-1 bg-luxury-charcoal text-white rounded text-[9px] uppercase tracking-wider cursor-pointer whitespace-nowrap hover:bg-luxury-gold hover:text-luxury-charcoal font-bold transition flex items-center justify-center"
                        >
                          Upload
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Loved by Influencers Section */}
                <div className="border border-zinc-150 rounded-xl p-5 space-y-4 bg-zinc-50/30">
                  <h4 className="text-[10px] uppercase tracking-wider text-luxury-gold-dark font-black border-b border-zinc-100 pb-1.5 flex items-center justify-between">
                    <span>3. Influencer & Celeb Endorsements</span>
                    <span className="text-zinc-400 lowercase font-medium">Feedback panels at the bottom of the home screen</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Influencer 1 */}
                    <div className="border border-zinc-200 rounded-lg p-4 space-y-3 bg-white">
                      <span className="text-[10px] font-bold text-luxury-gold-dark">Influencer Spot 1</span>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-zinc-400">Card Header / Title</label>
                        <input
                          type="text"
                          value={homeInf1Name}
                          onChange={(e) => setHomeInf1Name(e.target.value)}
                          className="w-full text-xs border border-zinc-200 px-2.5 py-1.5 rounded bg-white font-medium"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-zinc-400">Card Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={homeInf1Image}
                            onChange={(e) => setHomeInf1Image(e.target.value)}
                            className="flex-1 text-xs border border-zinc-200 px-2.5 py-1.5 rounded bg-white font-medium"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            id="inf1-upload"
                            onChange={(e) => handleFileUpload(e, setHomeInf1Image)}
                            className="hidden"
                          />
                          <label
                            htmlFor="inf1-upload"
                            className="px-2.5 py-1.5 bg-luxury-charcoal text-white rounded text-[10px] uppercase cursor-pointer hover:bg-luxury-gold hover:text-luxury-charcoal font-bold transition flex items-center justify-center whitespace-nowrap"
                          >
                            Upload
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-zinc-400">Quote / Testimonial Statement</label>
                        <textarea
                          rows={3}
                          value={homeInf1Text}
                          onChange={(e) => setHomeInf1Text(e.target.value)}
                          className="w-full text-xs border border-zinc-200 px-2.5 py-1.5 rounded leading-relaxed font-sans bg-white font-medium"
                        />
                      </div>
                    </div>

                    {/* Influencer 2 */}
                    <div className="border border-zinc-200 rounded-lg p-4 space-y-3 bg-white">
                      <span className="text-[10px] font-bold text-luxury-gold-dark">Influencer Spot 2</span>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-zinc-400">Card Header / Title</label>
                        <input
                          type="text"
                          value={homeInf2Name}
                          onChange={(e) => setHomeInf2Name(e.target.value)}
                          className="w-full text-xs border border-zinc-200 px-2.5 py-1.5 rounded bg-white font-medium"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-zinc-400">Card Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={homeInf2Image}
                            onChange={(e) => setHomeInf2Image(e.target.value)}
                            className="flex-1 text-xs border border-zinc-200 px-2.5 py-1.5 rounded bg-white font-medium"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            id="inf2-upload"
                            onChange={(e) => handleFileUpload(e, setHomeInf2Image)}
                            className="hidden"
                          />
                          <label
                            htmlFor="inf2-upload"
                            className="px-2.5 py-1.5 bg-luxury-charcoal text-white rounded text-[10px] uppercase cursor-pointer hover:bg-luxury-gold hover:text-luxury-charcoal font-bold transition flex items-center justify-center whitespace-nowrap"
                          >
                            Upload
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-zinc-400">Quote / Testimonial Statement</label>
                        <textarea
                          rows={3}
                          value={homeInf2Text}
                          onChange={(e) => setHomeInf2Text(e.target.value)}
                          className="w-full text-xs border border-zinc-200 px-2.5 py-1.5 rounded leading-relaxed font-sans bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-150">
                  {uploadingState && (
                    <span className="text-xs text-luxury-gold-dark font-bold animate-pulse py-3">Uploading asset...</span>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs uppercase font-bold tracking-widest transition shadow-md cursor-pointer"
                  >
                    Save Homepage Settings
                  </button>
                </div>

              </form>
            </div>
          )}
          
          {/* TAB: REVIEWS MODERATION PANEL */}
          {activeTab === "reviews" && (
            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-2xs space-y-6 animate-fade-in">
              <div className="border-b border-zinc-100 pb-3 flex justify-between items-center text-xs font-semibold">
                <h3 className="font-serif text-sm font-bold text-luxury-charcoal uppercase tracking-wider">
                  Reviews Moderation Panel
                </h3>
                <span className="text-zinc-400">Awaiting approval or hidden records</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-luxury-charcoal">
                {reviews.length === 0 ? (
                  <div className="md:col-span-2 text-center py-6 text-zinc-400 normal-case font-medium">No reviews logged.</div>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="border border-zinc-150 rounded-xl p-5 flex flex-col justify-between gap-4 bg-zinc-50/50">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm block">{r.userName}</p>
                            <p className="text-[9px] text-zinc-400 mt-0.5">Product ID: {r.productName}</p>
                          </div>
                          <div className="flex text-luxury-gold">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} size={11} className="fill-luxury-gold text-luxury-gold" />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5 font-medium leading-relaxed">
                          <p className="font-bold text-[11px] uppercase tracking-wider text-luxury-charcoal">"{r.title}"</p>
                          <p className="text-[11px] text-zinc-650 normal-case">"{r.text}"</p>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-zinc-200/50 pt-3 font-semibold">
                        <button
                          onClick={() => handleModerateReview(r.id, "approve")}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-[9px] font-bold uppercase tracking-wider transition"
                        >
                          <Check size={11} /> Approve
                        </button>
                        <button
                          onClick={() => handleModerateReview(r.id, "reject")}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-red-300 hover:bg-red-50 text-red-500 rounded text-[9px] font-bold uppercase tracking-wider transition"
                        >
                          <Trash2 size={11} /> Hide Review
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
