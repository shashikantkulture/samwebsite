"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronsLeftRight } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImg?: string;
  afterImg?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImg = "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=1000&auto=format&fit=crop&q=80",
  afterImg = "https://cdn.shopify.com/s/files/1/0932/4796/3414/files/Untitleddesign_2.png?v=1771474477",
  beforeLabel = "Before Styling",
  afterLabel = "After (SAMM Fairy Gown)"
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0-100)
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);
  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-2xl aspect-w-4 aspect-h-3 h-[350px] md:h-[450px] overflow-hidden rounded-2xl border border-zinc-100 shadow-sm cursor-ew-resize select-none"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* After image (background layer) */}
      <img
        src={afterImg}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div className="absolute right-4 bottom-4 bg-luxury-charcoal/80 backdrop-blur-xs text-luxury-nude text-[9px] uppercase tracking-widest px-2.5 py-1 font-bold rounded">
        {afterLabel}
      </div>

      {/* Before image (clipped overlay layer using GPU clip-path polygon) */}
      <img
        src={beforeImg}
        alt={beforeLabel}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      />
      
      <div 
        className="absolute left-4 bottom-4 bg-zinc-800/80 backdrop-blur-xs text-zinc-350 text-[9px] uppercase tracking-widest px-2.5 py-1 font-bold rounded pointer-events-none"
        style={{ opacity: sliderPosition > 10 ? 1 : 0, transition: "opacity 0.2s" }}
      >
        {beforeLabel}
      </div>

      {/* Divider slider bar */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-md flex items-center justify-center cursor-ew-resize pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-8 h-8 rounded-full bg-white text-luxury-charcoal shadow-lg border border-zinc-100 flex items-center justify-center -translate-x-1/2">
          <ChevronsLeftRight size={13} className="text-luxury-charcoal" />
        </div>
      </div>
    </div>
  );
};
export default BeforeAfterSlider;
