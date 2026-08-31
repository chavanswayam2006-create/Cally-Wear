"use client";

import React from "react";
import { Product } from "@/lib/types/product";
import { ProductCard } from "@/components/product/product-card";
import { Sparkles, RefreshCw } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  onResetFilters?: () => void;
}

export function ProductGrid({
  products,
  emptyMessage = "No sneakers match the selected filters.",
  onResetFilters,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center bg-white border border-[#E4DFD5] p-8">
        <div className="w-16 h-16 bg-[#F2EDE4] mx-auto flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-[#8C877E]" />
        </div>
        <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#12110E]">
          No Kicks Found
        </h3>
        <p className="text-sm text-[#6B665F] mt-2 max-w-sm mx-auto">
          {emptyMessage}
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#12110E] text-white text-xs font-black uppercase tracking-wider hover:bg-[#E85D2C] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
