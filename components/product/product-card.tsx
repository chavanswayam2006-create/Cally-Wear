"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Check, Flame } from "lucide-react";
import { Product } from "@/lib/types/product";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || "");
  const [isHovered, setIsHovered] = useState(false);
  const [selectedQuickSize, setSelectedQuickSize] = useState<string | null>(null);
  const [addedEffect, setAddedEffect] = useState(false);

  const { addItem, openCart } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const isWishlisted = isInWishlist(product.id);
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  // Active color object
  const currentColorObj = product.colors.find((c) => c.name === selectedColor);
  const primaryImage = currentColorObj?.images?.[0] || product.images[0];
  const secondaryImage = currentColorObj?.images?.[1] || product.images[1] || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedQuickSize(size);
    addItem(product, size, selectedColor, 1);
    setAddedEffect(true);
    setTimeout(() => {
      setAddedEffect(false);
    }, 1500);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      className="group relative flex flex-col bg-white border border-[#E4DFD5] hover:border-[#12110E] transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setSelectedQuickSize(null);
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-[#F2EDE4] overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {/* Primary Image */}
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className={`object-cover object-center transition-all duration-700 ${
              isHovered && secondaryImage !== primaryImage
                ? "opacity-0 scale-105"
                : "opacity-100 scale-100"
            }`}
          />

          {/* Secondary Hover Image */}
          {secondaryImage && secondaryImage !== primaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} alternate angle`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover object-center absolute inset-0 transition-all duration-700 ${
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="bg-[#12110E] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 shadow-sm">
              NEW DROP
            </span>
          )}
          {discount && discount > 0 ? (
            <span className="bg-[#E85D2C] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 shadow-sm">
              {discount}% OFF
            </span>
          ) : null}
          {product.stock <= 4 && product.stock > 0 && (
            <span className="bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 shadow-sm">
              ONLY {product.stock} LEFT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 p-2 rounded-none transition-all z-10 ${
            isWishlisted
              ? "bg-[#12110E] text-[#E85D2C]"
              : "bg-white/80 hover:bg-white text-[#12110E] opacity-90 group-hover:opacity-100"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              isWishlisted ? "fill-[#E85D2C]" : ""
            }`}
          />
        </button>

        {/* Quick Size Overlay on Hover (Desktop) */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-[#12110E]/95 text-white p-3 transition-all duration-300 transform hidden md:flex flex-col gap-1.5 z-20 ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#FAF8F5]">
            <span>Quick Add Size:</span>
            {addedEffect && (
              <span className="text-[#25D366] flex items-center gap-1">
                <Check className="w-3 h-3" /> Added to Bag
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => handleQuickAdd(e, size)}
                className={`flex-1 min-w-[36px] py-1 text-[11px] font-mono font-bold uppercase transition-all ${
                  selectedQuickSize === size
                    ? "bg-[#E85D2C] text-white"
                    : "bg-[#282622] text-[#FAF8F5] hover:bg-white hover:text-black"
                }`}
              >
                {size.replace("UK ", "")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category & Color Swatches */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#736F68]">
              {product.category} • {product.subCategory}
            </span>

            {/* Color preview dots */}
            {product.colors.length > 1 && (
              <div className="flex items-center gap-1">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    title={color.name}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedColor(color.name);
                    }}
                    className={`w-2.5 h-2.5 rounded-full border transition-all ${
                      selectedColor === color.name
                        ? "border-[#12110E] ring-1 ring-[#12110E] scale-110"
                        : "border-[#C5C0B8] opacity-75 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-display font-black text-sm uppercase tracking-tight text-[#12110E] hover:text-[#E85D2C] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Mobile Quick Action */}
        <div className="mt-3 pt-2 border-t border-[#F0ECE4] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-sm text-[#12110E]">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="font-mono text-xs text-[#8C877E] line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Mobile Direct Add Trigger */}
          <button
            onClick={(e) => handleQuickAdd(e, product.sizes[0])}
            aria-label="Add to bag"
            className="md:hidden p-1.5 bg-[#12110E] text-white hover:bg-[#E85D2C] transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
