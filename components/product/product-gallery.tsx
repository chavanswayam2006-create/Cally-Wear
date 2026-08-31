"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex] || images[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnail Strip */}
      <div className="flex md:flex-col gap-2.5 overflow-x-auto no-scrollbar shrink-0 md:w-20">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            aria-label={`View image ${index + 1} of ${productName}`}
            className={`relative aspect-[4/5] w-16 md:w-full bg-[#F2EDE4] overflow-hidden border-2 transition-all shrink-0 ${
              activeIndex === index
                ? "border-[#E85D2C] ring-1 ring-[#E85D2C]"
                : "border-[#E4DFD5] opacity-70 hover:opacity-100 hover:border-black"
            }`}
          >
            <Image
              src={img}
              alt={`${productName} thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image Display */}
      <div className="relative flex-1 aspect-[4/5] bg-[#F2EDE4] border border-[#E4DFD5] overflow-hidden group">
        <div
          ref={imageContainerRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsZoomModalOpen(true)}
          className="w-full h-full relative cursor-crosshair overflow-hidden"
        >
          {/* Main Photo */}
          <Image
            src={activeImage}
            alt={`${productName} - view ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-cover transition-transform duration-200 ${
              isHovering ? "scale-125 pointer-events-none origin-top-left" : "scale-100"
            }`}
            style={
              isHovering
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : undefined
            }
          />
        </div>

        {/* Zoom Hint / Expand Trigger */}
        <button
          onClick={() => setIsZoomModalOpen(true)}
          aria-label="Expand image"
          className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white text-[#12110E] shadow-md border border-[#E4DFD5] transition-all opacity-0 group-hover:opacity-100"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Counter Badge */}
        <div className="absolute bottom-4 left-4 bg-[#12110E]/80 text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 backdrop-blur-xs">
          {activeIndex + 1} / {images.length}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-[#12110E] hover:text-white text-[#12110E] border border-[#E4DFD5] transition-all opacity-0 group-hover:opacity-100 shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-[#12110E] hover:text-white text-[#12110E] border border-[#E4DFD5] transition-all opacity-0 group-hover:opacity-100 shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white pb-4">
            <h3 className="font-display font-black text-lg uppercase tracking-wider">
              {productName} — High-Res Gallery ({activeIndex + 1}/{images.length})
            </h3>
            <button
              onClick={() => setIsZoomModalOpen(false)}
              aria-label="Close zoom"
              className="p-2 text-white hover:text-[#E85D2C] transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="relative flex-1 max-h-[80vh] flex items-center justify-center">
            <div className="relative w-full h-full max-w-4xl max-h-full">
              <Image
                src={activeImage}
                alt={productName}
                fill
                className="object-contain"
              />
            </div>

            <button
              onClick={handlePrev}
              aria-label="Previous"
              className="absolute left-4 p-3 bg-white/10 hover:bg-white text-white hover:text-black transition-colors rounded-none"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next"
              className="absolute right-4 p-3 bg-white/10 hover:bg-white text-white hover:text-black transition-colors rounded-none"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          <div className="flex justify-center gap-2 pt-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative w-14 h-16 border-2 transition-all ${
                  activeIndex === idx ? "border-[#E85D2C]" : "border-white/30 opacity-60"
                }`}
              >
                <Image src={img} alt="thumb" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
