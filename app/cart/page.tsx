"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Truck,
  Tag,
  ShieldCheck,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getItemCount,
    getSubtotal,
    getDiscountAmount,
    getShippingFee,
    getTotal,
    getFreeShippingProgress,
    promoCode,
    applyPromoCode,
    removePromoCode,
    clearCart,
  } = useCartStore();

  const [inputCode, setInputCode] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingFee();
  const total = getTotal();
  const freeShipping = getFreeShippingProgress();

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyPromoCode(inputCode);
    if (res.success) {
      setPromoMessage({ text: res.message, error: false });
      setInputCode("");
    } else {
      setPromoMessage({ text: res.message, error: true });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAF8F5]">
        <div className="w-24 h-24 bg-[#EAE5DC] flex items-center justify-center mb-4 border border-[#E4DFD5]">
          <ShoppingBag className="w-12 h-12 text-[#8C877E]" />
        </div>
        <h1 className="font-display font-black text-3xl uppercase tracking-tight text-[#12110E]">
          Your Bag is Empty
        </h1>
        <p className="text-sm text-[#6B665F] mt-2 max-w-sm">
          You haven&apos;t added any sneakers to your bag yet. Explore our latest drop.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 px-8 py-4 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors shadow-lg"
        >
          <span>Explore All Kicks</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-6 border-b border-[#E4DFD5] flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
              CHECKOUT READY
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#12110E]">
              Shopping Bag ({itemCount} {itemCount === 1 ? "Item" : "Items"})
            </h1>
          </div>

          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12110E] hover:text-[#E85D2C]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Free Shipping Alert Bar */}
        <div className="mt-6 p-4 bg-[#12110E] text-white flex items-center justify-between border border-[#282622]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase">
            <Truck className="w-4 h-4 text-[#E85D2C]" />
            {freeShipping.remaining === 0 ? (
              <span className="text-[#25D366]">You qualify for FREE Express Shipping!</span>
            ) : (
              <span>
                Add <strong className="text-[#E85D2C]">{formatPrice(freeShipping.remaining)}</strong> more to get Free Express Delivery
              </span>
            )}
          </div>
          <span className="text-xs font-mono font-bold text-[#E85D2C]">{freeShipping.percent}%</span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-[#E4DFD5] divide-y divide-[#E4DFD5]">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Image */}
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative w-full sm:w-28 aspect-[4/5] bg-[#F2EDE4] overflow-hidden border border-[#E4DFD5] shrink-0"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-display font-black text-base sm:text-lg uppercase tracking-tight text-[#12110E] hover:text-[#E85D2C] transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#8C877E] hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="text-xs font-semibold text-[#6B665F] mt-1 space-x-3">
                        <span>Size: <strong className="text-[#12110E]">{item.size}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-[#12110E]">{item.color}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F2EDE4]">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E4DFD5] bg-[#FAF8F5]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 text-[#12110E] hover:bg-white disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-2 text-[#12110E] hover:bg-white disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-display font-black text-base sm:text-lg text-[#12110E]">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <div className="text-xs text-[#8C877E] line-through font-mono">
                            {formatPrice(item.compareAtPrice * item.quantity)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={clearCart}
                className="text-xs font-bold text-[#8C877E] hover:text-red-600 underline uppercase"
              >
                Clear Entire Bag
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E4DFD5] p-6 space-y-6">
              <h3 className="font-display font-black text-lg uppercase tracking-wider text-[#12110E] pb-3 border-b border-[#E4DFD5]">
                Order Summary
              </h3>

              {/* Coupon Form */}
              {promoCode ? (
                <div className="flex items-center justify-between p-3 bg-[#FFF0EB] border border-[#E85D2C] text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#E85D2C]">
                    <Tag className="w-4 h-4" />
                    <span>Coupon &apos;{promoCode}&apos; (-{formatPrice(discount)})</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-xs text-[#8C877E] hover:text-black underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (CALLY10)"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="flex-1 px-3 py-2.5 text-xs border border-[#E4DFD5] bg-[#FAF8F5] uppercase font-mono focus:outline-none focus:border-black"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#12110E] text-white text-xs font-black uppercase tracking-wider hover:bg-[#E85D2C] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p
                      className={`text-xs font-semibold ${
                        promoMessage.error ? "text-red-600" : "text-emerald-700"
                      }`}
                    >
                      {promoMessage.text}
                    </p>
                  )}
                </form>
              )}

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs text-[#6B665F] pt-2 border-t border-[#E4DFD5]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#12110E] font-mono">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#E85D2C] font-semibold">
                    <span>Discount</span>
                    <span className="font-mono">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-[#12110E]">
                    {shipping === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-display font-black text-[#12110E] pt-3 border-t border-[#E4DFD5]">
                  <span>Total</span>
                  <span className="font-mono">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Link */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#E85D2C] hover:bg-[#D44E1F] text-white font-display font-black text-sm uppercase tracking-wider shadow-lg transition-colors group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="pt-2 text-center text-[10px] text-[#8C877E] uppercase font-mono tracking-wider space-y-1">
                <p>100% Genuine Verified Authenticity</p>
                <p>Doorstep 7-Day Size Exchanges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
