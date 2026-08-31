"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Tag, Check, Sparkles } from "lucide-react";
import { useCartStore, FREE_SHIPPING_THRESHOLD } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
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
  } = useCartStore();

  const [inputCode, setInputCode] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Cart Panel */}
      <div className="relative w-full max-w-md bg-[#FAF8F5] text-[#12110E] h-full flex flex-col z-10 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#E4DFD5] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#E85D2C]" />
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-[#12110E]">
              Your Bag ({itemCount})
            </h2>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-1.5 text-[#12110E] hover:text-[#E85D2C] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-[#12110E] text-[#FAF8F5] px-5 py-3 border-b border-[#282622]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#E85D2C]" />
              {freeShipping.remaining === 0 ? (
                <span className="text-[#25D366]">You&apos;ve unlocked FREE Express Shipping!</span>
              ) : (
                <span>
                  Add <strong className="text-[#E85D2C]">{formatPrice(freeShipping.remaining)}</strong> for FREE Shipping
                </span>
              )}
            </span>
            <span className="text-[10px] text-[#99948D]">{freeShipping.percent}%</span>
          </div>
          <div className="w-full bg-[#282622] h-1.5 overflow-hidden">
            <div
              className="bg-[#E85D2C] h-full transition-all duration-500"
              style={{ width: `${freeShipping.percent}%` }}
            />
          </div>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-[#EAE5DC] flex items-center justify-center rounded-none mb-4">
              <ShoppingBag className="w-10 h-10 text-[#8C877E]" />
            </div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#12110E]">
              Your Bag is Empty
            </h3>
            <p className="text-sm text-[#6B665F] mt-2 max-w-xs">
              Looks like you haven&apos;t added any heat to your cart yet. Explore our latest drops.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#12110E] text-white font-display font-black text-sm uppercase tracking-wider hover:bg-[#E85D2C] transition-colors"
            >
              <span>Explore The Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#E4DFD5]">
              {items.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="relative w-20 h-24 bg-[#EAE5DC] shrink-0 border border-[#E4DFD5] overflow-hidden"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="font-display font-black text-sm uppercase tracking-tight text-[#12110E] hover:text-[#E85D2C] transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="text-[#8C877E] hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs font-semibold text-[#6B665F] mt-1 space-x-2">
                        <span>Size: <strong className="text-[#12110E]">{item.size}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-[#12110E]">{item.color}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E4DFD5] bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="p-1.5 text-[#12110E] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label="Increase quantity"
                          className="p-1.5 text-[#12110E] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-display font-black text-sm text-[#12110E]">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <div className="text-[10px] text-[#8C877E] line-through">
                            {formatPrice(item.compareAtPrice * item.quantity)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="p-5 bg-white border-t border-[#E4DFD5] space-y-3">
              {promoCode ? (
                <div className="flex items-center justify-between p-2.5 bg-[#FFF0EB] border border-[#E85D2C] text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#E85D2C]">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon &apos;{promoCode}&apos; Applied (-{discount > 0 ? formatPrice(discount) : ""})</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-xs font-semibold text-[#8C877E] hover:text-black underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. CALLY10)"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-[#E4DFD5] bg-[#FAF8F5] focus:outline-none focus:border-[#12110E] uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#12110E] text-white text-xs font-black uppercase tracking-wider hover:bg-[#E85D2C] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p
                      className={`text-[11px] font-semibold ${
                        promoMessage.error ? "text-red-600" : "text-emerald-700"
                      }`}
                    >
                      {promoMessage.text}
                    </p>
                  )}
                </form>
              )}

              {/* Cost Summary */}
              <div className="space-y-1.5 text-xs text-[#6B665F] pt-2 border-t border-[#E4DFD5]">
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
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-[#12110E]">
                    {shipping === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase text-[11px]">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-display font-black text-[#12110E] pt-2 border-t border-[#E4DFD5]">
                  <span>Total</span>
                  <span className="font-mono text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#E85D2C] hover:bg-[#D44E1F] text-white font-display font-black text-sm uppercase tracking-wider shadow-lg transition-colors group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="flex items-center justify-between text-[11px] text-[#8C877E] pt-1">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="underline hover:text-black font-semibold"
                  >
                    View Bag Deep Link
                  </Link>
                  <span>Taxes included. 100% Authentic.</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
