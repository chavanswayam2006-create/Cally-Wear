"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { Product } from "@/lib/types/product";
import { ProductCard } from "@/components/product/product-card";

interface NewArrivalsProps {
  products: Product[];
}

export function NewArrivals({ products }: NewArrivalsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -360 : 360;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-24 bg-[#FAF8F5] border-b border-[#E4DFD5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#E4DFD5]">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E85D2C] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FRESH FROM THE LAB</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-[#12110E]">
              New Arrivals & Drop 04
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop?sort=newest"
              className="text-xs font-black uppercase tracking-wider text-[#12110E] hover:text-[#E85D2C] transition-colors flex items-center gap-1 group mr-2"
            >
              <span>Explore All Drops</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="p-2.5 bg-white hover:bg-[#12110E] hover:text-white text-[#12110E] border border-[#E4DFD5] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="p-2.5 bg-white hover:bg-[#12110E] hover:text-white text-[#12110E] border border-[#E4DFD5] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Rail */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pt-8 pb-4 snap-x snap-mandatory"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[240px] sm:w-[280px] md:w-[320px] shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
