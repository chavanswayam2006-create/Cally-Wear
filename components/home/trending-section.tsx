"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { Product } from "@/lib/types/product";
import { ProductCard } from "@/components/product/product-card";

interface TrendingSectionProps {
  products: Product[];
}

export function TrendingSection({ products }: TrendingSectionProps) {
  const [activeTab, setActiveTab] = useState<"all" | "men" | "women">("all");

  const filteredProducts = products
    .filter((p) => {
      if (activeTab === "all") return true;
      return p.category === activeTab || p.category === "unisex";
    })
    .slice(0, 8);

  return (
    <section className="py-16 md:py-24 bg-[#FAF8F5] border-b border-[#E4DFD5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E4DFD5]">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E85D2C] mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>HIGH DEMAND HEAT</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-[#12110E]">
              Trending Now
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-[#EFECE6] p-1 border border-[#E4DFD5] text-xs font-black uppercase tracking-wider">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 transition-all ${
                activeTab === "all"
                  ? "bg-[#12110E] text-white shadow-xs"
                  : "text-[#6B665F] hover:text-black"
              }`}
            >
              All Drops
            </button>
            <button
              onClick={() => setActiveTab("men")}
              className={`px-4 py-2 transition-all ${
                activeTab === "men"
                  ? "bg-[#12110E] text-white shadow-xs"
                  : "text-[#6B665F] hover:text-black"
              }`}
            >
              Men&apos;s
            </button>
            <button
              onClick={() => setActiveTab("women")}
              className={`px-4 py-2 transition-all ${
                activeTab === "women"
                  ? "bg-[#12110E] text-white shadow-xs"
                  : "text-[#6B665F] hover:text-black"
              }`}
            >
              Women&apos;s
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 pt-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href={`/shop/${activeTab === "all" ? "" : activeTab}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors group"
          >
            <span>View All {activeTab === "all" ? "Footwear" : activeTab === "men" ? "Men's Kicks" : "Women's Kicks"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
