"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: any) => {
    const size = selectedSizes[product.id] || product.sizes[0];
    const color = product.colors[0]?.name || "Standard";
    addItem(product, size, color, 1);
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const handleMoveAllToBag = () => {
    items.forEach((p) => {
      const size = selectedSizes[p.id] || p.sizes[0];
      const color = p.colors[0]?.name || "Standard";
      addItem(p, size, color, 1);
    });
    openCart();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAF8F5]">
        <div className="w-24 h-24 bg-[#EAE5DC] flex items-center justify-center mb-4 border border-[#E4DFD5]">
          <Heart className="w-12 h-12 text-[#8C877E]" />
        </div>
        <h1 className="font-display font-black text-3xl uppercase tracking-tight text-[#12110E]">
          Your Wishlist is Empty
        </h1>
        <p className="text-sm text-[#6B665F] mt-2 max-w-sm">
          Save your favorite kicks here to keep track of drops and stock levels.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 px-8 py-4 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors shadow-lg"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-6 border-b border-[#E4DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
              SAVED ROTATIONS
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#12110E]">
              Wishlist ({items.length} {items.length === 1 ? "Item" : "Items"})
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMoveAllToBag}
              className="px-5 py-2.5 bg-[#12110E] hover:bg-[#E85D2C] text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Move All to Bag</span>
            </button>
            <button
              onClick={clearWishlist}
              className="px-4 py-2.5 border border-[#E4DFD5] hover:border-red-600 hover:text-red-600 text-xs font-bold uppercase transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
          {items.map((product) => {
            const currentSize = selectedSizes[product.id] || product.sizes[0];
            const isAdded = addedItems[product.id];

            return (
              <div
                key={product.id}
                className="bg-white border border-[#E4DFD5] hover:border-black transition-all flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] bg-[#F2EDE4] overflow-hidden">
                  <Link href={`/products/${product.slug}`} className="block w-full h-full">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <button
                    onClick={() => removeItem(product.id)}
                    aria-label="Remove from wishlist"
                    className="absolute top-2.5 right-2.5 p-2 bg-white text-[#12110E] hover:text-red-600 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#E85D2C] uppercase tracking-wider block mb-1">
                      {product.category} • {product.subCategory}
                    </span>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-display font-black text-base uppercase text-[#12110E] hover:text-[#E85D2C] transition-colors truncate">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="font-mono font-bold text-sm text-[#12110E] mt-1">
                      {formatPrice(product.price)}
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-[#6B665F] block">
                      Size:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => handleSelectSize(product.id, sz)}
                          className={`px-2 py-1 text-[10px] font-mono font-bold uppercase border transition-all ${
                            currentSize === sz
                              ? "bg-[#12110E] text-white border-black"
                              : "bg-[#FAF8F5] text-black border-[#E4DFD5] hover:border-black"
                          }`}
                        >
                          {sz.replace("UK ", "")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      isAdded
                        ? "bg-[#25D366] text-black"
                        : "bg-[#12110E] hover:bg-[#E85D2C] text-white"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Bag ({currentSize})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
