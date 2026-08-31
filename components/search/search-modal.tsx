"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Flame, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { products } from "@/lib/data/products";
import { Product } from "@/lib/types/product";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingSearches = [
  "Apex Tech Runner",
  "Strata Platform",
  "Carbon Racer",
  "Drop 04",
  "Retro Low",
  "Cloud Slide",
  "Tactical High",
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();
    const filtered = products.filter((item) => {
      const matchName = item.name.toLowerCase().includes(cleanQuery);
      const matchCategory = item.category.toLowerCase().includes(cleanQuery);
      const matchSub = item.subCategory.toLowerCase().includes(cleanQuery);
      const matchDesc = item.description.toLowerCase().includes(cleanQuery);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(cleanQuery));
      return matchName || matchCategory || matchSub || matchDesc || matchTags;
    });

    setResults(filtered);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] text-[#12110E] shadow-2xl border border-[#282622] z-10 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Search Bar Input */}
        <div className="p-4 md:p-6 border-b border-[#E4DFD5] bg-white flex items-center gap-3">
          <Search className="w-6 h-6 text-[#E85D2C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by shoe name, silhouette, tag, or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-base md:text-xl font-display font-bold text-[#12110E] placeholder:text-[#8C877E] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[#8C877E] hover:text-black p-1 text-xs uppercase font-bold"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-2 text-[#12110E] hover:text-[#E85D2C] transition-colors ml-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!query ? (
            <div className="space-y-6">
              {/* Trending Queries */}
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6B665F] mb-3">
                  <TrendingUp className="w-4 h-4 text-[#E85D2C]" />
                  <span>Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3.5 py-1.5 bg-white hover:bg-[#12110E] hover:text-white border border-[#E4DFD5] text-xs font-semibold text-[#12110E] transition-colors flex items-center gap-1.5"
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6B665F] mb-3">
                  <Sparkles className="w-4 h-4 text-[#E85D2C]" />
                  <span>Quick Categories</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Link
                    href="/shop/men"
                    onClick={onClose}
                    className="p-3 bg-white border border-[#E4DFD5] hover:border-black transition-colors"
                  >
                    <span className="text-xs font-display font-black uppercase text-[#12110E] block">
                      Men&apos;s Footwear
                    </span>
                    <span className="text-[11px] text-[#8C877E]">10 Silhouettes</span>
                  </Link>
                  <Link
                    href="/shop/women"
                    onClick={onClose}
                    className="p-3 bg-white border border-[#E4DFD5] hover:border-black transition-colors"
                  >
                    <span className="text-xs font-display font-black uppercase text-[#12110E] block">
                      Women&apos;s Footwear
                    </span>
                    <span className="text-[11px] text-[#8C877E]">8 Silhouettes</span>
                  </Link>
                  <Link
                    href="/shop?category=running"
                    onClick={onClose}
                    className="p-3 bg-white border border-[#E4DFD5] hover:border-black transition-colors"
                  >
                    <span className="text-xs font-display font-black uppercase text-[#12110E] block">
                      Performance & Run
                    </span>
                    <span className="text-[11px] text-[#8C877E]">Carbon & Superfoam</span>
                  </Link>
                  <Link
                    href="/shop?category=slides"
                    onClick={onClose}
                    className="p-3 bg-white border border-[#E4DFD5] hover:border-black transition-colors"
                  >
                    <span className="text-xs font-display font-black uppercase text-[#12110E] block">
                      Slides & Mules
                    </span>
                    <span className="text-[11px] text-[#8C877E]">Recovery Foam</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-display font-black text-xl uppercase tracking-tight text-[#12110E]">
                No matching kicks found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-[#6B665F] mt-2">
                Try checking for typos or searching by broad terms like &quot;Running&quot;, &quot;Platform&quot;, or &quot;Slide&quot;.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#12110E] text-white text-xs font-black uppercase tracking-wider hover:bg-[#E85D2C] transition-colors"
              >
                <span>Browse Entire Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E4DFD5] mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#6B665F]">
                  Found {results.length} results
                </span>
                <Link
                  href={`/shop?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-xs font-bold text-[#E85D2C] hover:underline flex items-center gap-1"
                >
                  <span>View all in shop</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2.5 bg-white border border-[#E4DFD5] hover:border-black transition-all group"
                  >
                    <div className="relative w-16 h-16 bg-[#EAE5DC] shrink-0 overflow-hidden border border-[#E4DFD5]">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#E85D2C] uppercase tracking-wider block">
                        {product.category} • {product.subCategory}
                      </span>
                      <h4 className="font-display font-black text-sm uppercase text-[#12110E] truncate group-hover:text-[#E85D2C] transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-xs">
                        <span className="font-bold text-[#12110E]">{formatPrice(product.price)}</span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-[#8C877E] line-through text-[10px]">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-[#EFECE6] border-t border-[#E4DFD5] text-[11px] text-[#6B665F] flex items-center justify-between px-6">
          <span>Press <strong>ESC</strong> to close</span>
          <span>Tip: Use <strong>Cmd + K</strong> anytime</span>
        </div>
      </div>
    </div>
  );
}
