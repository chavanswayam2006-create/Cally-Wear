"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types/product";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductCard } from "@/components/product/product-card";
import { ArrowLeft, ChevronRight, Flame } from "lucide-react";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || "");

  // Determine gallery images based on selected colorway
  const currentColorObj = product.colors.find((c) => c.name === selectedColor);
  const activeImages =
    currentColorObj?.images && currentColorObj.images.length > 0
      ? currentColorObj.images
      : product.images;

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Breadcrumb Bar */}
      <div className="border-b border-[#E4DFD5] bg-white py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold text-[#6B665F]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#8C877E]" />
            <Link href="/shop" className="hover:text-black transition-colors">
              Footwear
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#8C877E]" />
            <Link
              href={`/shop/${product.category === "unisex" ? "" : product.category}`}
              className="hover:text-black transition-colors uppercase"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#8C877E]" />
            <span className="text-[#12110E] truncate font-bold uppercase">
              {product.name}
            </span>
          </div>

          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1 hover:text-[#E85D2C] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to catalog</span>
          </Link>
        </div>
      </div>

      {/* Main PDP Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Gallery (Thumbnails + Main Image Zoom) */}
          <div className="lg:col-span-7">
            <div className="sticky top-24">
              <ProductGallery
                key={selectedColor} // re-render gallery smoothly when colorway changes
                images={activeImages}
                productName={product.name}
              />
            </div>
          </div>

          {/* Right: Product Info, Variants, Add to Bag */}
          <div className="lg:col-span-5">
            <ProductInfo
              product={product}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
          </div>
        </div>

        {/* You May Also Like / Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E4DFD5]">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#E4DFD5]">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
                  COMPLETE YOUR ROTATION
                </span>
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#12110E]">
                  You May Also Like
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-black uppercase tracking-wider text-[#12110E] hover:text-[#E85D2C] transition-colors"
              >
                View Full Shop
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
