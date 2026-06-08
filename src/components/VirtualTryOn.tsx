"use client";

import React, { useState, useRef } from "react";
import { Upload, Sparkles, ShoppingBag, Eye, RefreshCw, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { CartItem } from "../types";

const FACES = [
  { id: "f1", name: "Model Maya", image: "https://images.unsplash.com/photo-1595959183079-c1b0a865578a?w=600&auto=format&fit=crop" },
  { id: "f2", name: "Model Aisha", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop" },
  { id: "f3", name: "Model Kiara", image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&auto=format&fit=crop" }
];

const ITEMS_TO_TRY = [
  { id: "p1", name: "Corset Jumpsuit", category: "jumpsuits", overlayImg: "https://cdn.shopify.com/s/files/1/0932/4796/3414/files/PRELIMENARY-34.png?v=1771478209", overlayStyle: "top-[30%] w-[70%] h-[60%] rounded-b-2xl" },
  { id: "p2", name: "Fairy-Style Gown", category: "gowns", overlayImg: "https://cdn.shopify.com/s/files/1/0932/4796/3414/files/Untitleddesign_2.png?v=1771474477", overlayStyle: "top-[30%] w-[75%] h-[65%] rounded-b-2xl scale-105" },
  { id: "p4", name: "Hot Pink Co-ord", category: "coords", overlayImg: "https://cdn.shopify.com/s/files/1/0932/4796/3414/files/SR042415_1.jpg?v=1754564368", overlayStyle: "top-[30%] w-[70%] h-[60%] rounded-b-2xl" }
];

const COLORS = [
  { name: "Original", hex: "#E5E7EB", filter: "" },
  { name: "Royal Blue", hex: "#1D4ED8", filter: "hue-rotate-[180deg] saturate-150" },
  { name: "Emerald Green", hex: "#047857", filter: "hue-rotate-[100deg] saturate-150" },
  { name: "Warm Gold", hex: "#D97706", filter: "hue-rotate-[40deg] saturate-150 brightness-110" }
];

export const VirtualTryOn: React.FC = () => {
  const { addToCart } = useCart();
  const { products } = useApp();

  const [selectedFace, setSelectedFace] = useState(FACES[0].image);
  const [selectedItem, setSelectedItem] = useState(ITEMS_TO_TRY[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setUploadError("Image size exceeds 3MB. Please select a smaller photo.");
        return;
      }
      setIsUploading(true);
      setUploadError("");
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedFace(event.target.result as string);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerProcess = (faceUrl: string, itemObj: typeof ITEMS_TO_TRY[0], colorObj: typeof COLORS[0]) => {
    setIsProcessing(true);
    setSelectedFace(faceUrl);
    setSelectedItem(itemObj);
    setSelectedColor(colorObj);
    
    // Simulate real-time alignment delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 1200);
  };

  const handleAddTryOnProduct = () => {
    const product = products.find((p) => p.id === selectedItem.id);
    if (!product) return;
    const defVar = product.variants[0];
    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0],
      price: product.price,
      salePrice: product.salePrice,
      quantity: 1,
      selectedColor: defVar ? defVar.color : "Default",
      selectedLength: defVar ? defVar.length : "Standard",
      selectedBase: defVar ? defVar.base : undefined,
      sku: defVar ? defVar.sku : `TO-${product.id}`
    };
    addToCart(cartItem);
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-100 shadow-md p-6 sm:p-10 max-w-4xl mx-auto font-sans">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Try On Canvas Viewport */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="relative aspect-w-4 aspect-h-5 h-[380px] sm:h-[440px] bg-luxury-nude rounded-2xl overflow-hidden border border-zinc-100 flex items-center justify-center">
            
            {/* Base Portrait Image */}
            <img
              src={selectedFace}
              alt="Virtual Try-On base profile"
              className="w-full h-full object-cover"
            />

            {/* Neural alignment processing spinner */}
            {isProcessing && (
              <div className="absolute inset-0 bg-luxury-charcoal/40 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-3 transition">
                <RefreshCw className="animate-spin text-luxury-gold" size={32} />
                <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-nude">
                  Fitting Outfit Layers...
                </span>
              </div>
            )}

            {/* Overlay try-on asset */}
            {!isProcessing && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Outfit transformation overlay layer */}
                <div 
                  className={`absolute bg-contain bg-no-repeat bg-center pointer-events-none transition-all duration-300 ${selectedItem.overlayStyle} ${selectedColor.filter}`}
                  style={{
                    backgroundImage: `url('${selectedItem.overlayImg}')`,
                    opacity: 0.9
                  }}
                />
                
                {/* Sizing integration pointer */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-luxury-gold text-luxury-charcoal text-[7px] uppercase font-black px-2 py-0.5 rounded tracking-widest flex items-center gap-0.5 shadow-xs border border-white">
                  <Sparkles size={8} /> Outfit Layer Synced
                </div>
              </div>
            )}

            <span className="absolute left-4 bottom-4 bg-luxury-charcoal/80 backdrop-blur-xs text-white text-[9px] uppercase tracking-widest px-2.5 py-1 font-semibold rounded">
              Interactive Preview
            </span>
          </div>

          {/* Model picker and upload options */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
              1. Choose Profile Model
            </span>
            <div className="flex items-center gap-3">
              {FACES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => triggerProcess(f.image, selectedItem, selectedColor)}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition ${
                    selectedFace === f.image ? "border-luxury-gold scale-105 shadow-sm" : "border-zinc-200 hover:border-zinc-450"
                  }`}
                  title={f.name}
                >
                  <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                </button>
              ))}

              <div className="h-6 w-px bg-zinc-200 mx-1" />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="h-12 px-4 border border-dashed border-zinc-350 hover:border-luxury-charcoal rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-650 hover:text-luxury-charcoal transition flex items-center gap-1.5 bg-zinc-50"
              >
                <Upload size={13} /> {isUploading ? "Uploading..." : "Upload Photo"}
              </button>
            </div>
            {uploadError && (
              <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                <AlertCircle size={10} /> {uploadError}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Options & Try On Controllers */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-luxury-charcoal tracking-wide flex items-center gap-2">
              Mix & Match Lookbook <Sparkles size={18} className="text-luxury-gold fill-luxury-gold animate-pulse" />
            </h4>
            <p className="text-xs text-zinc-500 normal-case">
              Select model frames and apparel styles. Match options and tints to preview how different corset jumpsuits, kids gowns, and co-ords layer dynamically.
            </p>
          </div>

          {/* Try On Items Selector */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
              2. Select Apparel Piece
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ITEMS_TO_TRY.map((item) => {
                const isCurrent = selectedItem.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => triggerProcess(selectedFace, item, selectedColor)}
                    className={`p-3.5 border rounded-xl text-left transition duration-200 ${
                      isCurrent
                        ? "border-luxury-gold bg-luxury-champagne/15"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold text-luxury-charcoal uppercase tracking-wider">{item.name}</p>
                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-0.5">{item.category}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color filter Accent Selector */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
              3. Tint Accent Color
            </span>
            <div className="flex gap-3.5">
              {COLORS.map((c) => {
                const isCurrentColor = selectedColor.name === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => triggerProcess(selectedFace, selectedItem, c)}
                    className={`group flex flex-col items-center gap-1.5 focus:outline-none`}
                  >
                    <span
                      className={`w-9 h-9 rounded-full relative flex items-center justify-center transition border ${
                        isCurrentColor
                          ? "ring-2 ring-luxury-gold ring-offset-2 scale-105"
                          : "border-black/10 group-hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {isCurrentColor && <Eye size={14} className="text-white drop-shadow-xs" />}
                    </span>
                    <span className={`text-[9px] uppercase tracking-widest ${isCurrentColor ? "text-luxury-charcoal font-bold" : "text-zinc-400"}`}>
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details & CTA Add to bag */}
          <div className="bg-luxury-nude p-5 rounded-2xl border border-luxury-nude-dark space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-luxury-charcoal">
                  Selected Outfit Match
                </h5>
                <p className="text-[10px] text-zinc-500 mt-0.5 normal-case">
                  {selectedItem.name} ({selectedColor.name} Tint)
                </p>
              </div>
              <span className="text-sm font-semibold text-luxury-gold-dark font-serif">
                Rs. {products.find((p) => p.id === selectedItem.id)?.price}
              </span>
            </div>

            <button
              onClick={handleAddTryOnProduct}
              className="w-full flex items-center justify-center gap-1.5 py-3.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <ShoppingBag size={13} /> Add Try-On Product to Bag
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
export default VirtualTryOn;
