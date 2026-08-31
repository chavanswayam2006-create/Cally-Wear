"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ChevronRight, Flame, Sparkles, Heart, ShoppingBag, User, PhoneCall, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  wishlistCount: number;
  cartCount: number;
}

export function MobileMenu({
  isOpen,
  onClose,
  onOpenSearch,
  onOpenCart,
  wishlistCount,
  cartCount,
}: MobileMenuProps) {
  const [activeTab, setActiveTab] = useState<"men" | "women" | "collections">("men");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-[#FAF8F5] text-[#12110E] h-full flex flex-col z-10 shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 border-b border-[#E4DFD5] flex items-center justify-between bg-white">
          <Logo size="sm" />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 text-[#12110E] hover:text-[#E85D2C] transition-colors rounded-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Tabs */}
        <div className="grid grid-cols-3 border-b border-[#E4DFD5] bg-[#EFECE6] text-xs font-black uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("men")}
            className={`py-3 text-center transition-colors border-b-2 ${
              activeTab === "men"
                ? "bg-[#FAF8F5] border-[#E85D2C] text-[#12110E]"
                : "border-transparent text-[#6B665F] hover:text-black"
            }`}
          >
            Men
          </button>
          <button
            onClick={() => setActiveTab("women")}
            className={`py-3 text-center transition-colors border-b-2 ${
              activeTab === "women"
                ? "bg-[#FAF8F5] border-[#E85D2C] text-[#12110E]"
                : "border-transparent text-[#6B665F] hover:text-black"
            }`}
          >
            Women
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`py-3 text-center transition-colors border-b-2 ${
              activeTab === "collections"
                ? "bg-[#FAF8F5] border-[#E85D2C] text-[#12110E]"
                : "border-transparent text-[#6B665F] hover:text-black"
            }`}
          >
            Vault
          </button>
        </div>

        {/* Navigation list */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {activeTab === "men" && (
            <div className="space-y-4">
              <Link
                href="/shop/men"
                onClick={onClose}
                className="flex items-center justify-between font-display font-black text-lg uppercase tracking-tight py-2 border-b border-[#E4DFD5] text-[#12110E]"
              >
                <span>All Men&apos;s Footwear</span>
                <ChevronRight className="w-5 h-5 text-[#E85D2C]" />
              </Link>
              <div className="space-y-2.5 text-sm font-semibold text-[#4A4742] pl-2">
                <Link
                  href="/shop/men?category=running"
                  onClick={onClose}
                  className="block py-1 hover:text-[#E85D2C]"
                >
                  Running & Performance
                </Link>
                <Link
                  href="/shop/men?category=streetwear"
                  onClick={onClose}
                  className="block py-1 hover:text-[#E85D2C]"
                >
                  Streetwear & High-Tops
                </Link>
                <Link
                  href="/shop/men?category=sneakers"
                  onClick={onClose}
                  className="block py-1 hover:text-[#E85D2C]"
                >
                  Retro & Court Lows
                </Link>
                <Link
                  href="/shop/men?category=basketball"
                  onClick={onClose}
                  className="block py-1 hover:text-[#E85D2C]"
                >
                  Basketball & Mid-Tops
                </Link>
                <Link
                  href="/shop/men?category=slides"
                  onClick={onClose}
                  className="block py-1 hover:text-[#E85D2C]"
                >
                  Slides & Recovery
                </Link>
              </div>

              {/* Highlight drop */}
              <Link
                href="/products/cally-apex-tech-runner"
                onClick={onClose}
                className="block bg-[#12110E] text-white p-3 border-l-4 border-[#E85D2C] mt-4"
              >
                <span className="text-[10px] font-bold text-[#E85D2C] uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3" /> FEATURED RELEASE
                </span>
                <p className="font-display font-black text-sm uppercase mt-0.5">
                  Apex Tech Runner — Drop 04
                </p>
              </Link>
            </div>
          )}

          {activeTab === "women" && (
            <div className="space-y-4">
              <Link
                href="/shop/women"
                onClick={onClose}
                className="flex items-center justify-between font-display font-black text-lg uppercase tracking-tight py-2 border-b border-[#E4DFD5] text-[#12110E]"
              >
                <span>All Women&apos;s Footwear</span>
                <ChevronRight className="w-5 h-5 text-[#E85D2C]" />
              </Link>
              <div className="space-y-2.5 text-sm font-semibold text-[#4A4742] pl-2">
                <Link
                  href="/shop/women?category=streetwear"
                  onClick={onClose}
                  className="block py-1 hover:text-[#E85D2C]"
                >
                  Platform & Chunky Soles
                </Link>
                <Link
                  href="/shop/women?category=sneakers"
                  onClick={onClose}
                  className="block py-1 hover:text-[#E85D2C]"
                >
                  Clean Minimalist Court
                </Link>
                <Link
                  href="/shop/women?category=running"
                  onClick={onClose}
                  className="block py-1 hover:text-[#E85D2C]"
                >
                  Knit Trainers & Running
                </Link>
                <Link
                  href="/shop/women?category=slides"
                  onClick={onClose}
                  className="block py-1 hover:text-[#E85D2C]"
                >
                  Cloud Slides & Mules
                </Link>
              </div>

              {/* Highlight drop */}
              <Link
                href="/products/cally-strata-chunky-platform"
                onClick={onClose}
                className="block bg-[#12110E] text-white p-3 border-l-4 border-[#E85D2C] mt-4"
              >
                <span className="text-[10px] font-bold text-[#E85D2C] uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3" /> BESTSELLER
                </span>
                <p className="font-display font-black text-sm uppercase mt-0.5">
                  Strata Chunky Platform 52mm
                </p>
              </Link>
            </div>
          )}

          {activeTab === "collections" && (
            <div className="space-y-3">
              <Link
                href="/collections/monochrome-vault"
                onClick={onClose}
                className="block p-3 border border-[#E4DFD5] bg-white hover:border-[#12110E]"
              >
                <span className="text-[10px] text-[#E85D2C] font-bold uppercase">DROP 04</span>
                <h4 className="font-display font-black text-sm uppercase text-[#12110E]">Monochrome Vault</h4>
              </Link>
              <Link
                href="/collections/street-classics"
                onClick={onClose}
                className="block p-3 border border-[#E4DFD5] bg-white hover:border-[#12110E]"
              >
                <span className="text-[10px] text-[#E85D2C] font-bold uppercase">ESSENTIALS</span>
                <h4 className="font-display font-black text-sm uppercase text-[#12110E]">Street Classics</h4>
              </Link>
              <Link
                href="/collections/performance-lab"
                onClick={onClose}
                className="block p-3 border border-[#E4DFD5] bg-white hover:border-[#12110E]"
              >
                <span className="text-[10px] text-[#E85D2C] font-bold uppercase">CARBON RACER</span>
                <h4 className="font-display font-black text-sm uppercase text-[#12110E]">Performance Lab</h4>
              </Link>
              <Link
                href="/collections/summer-slides-mules"
                onClick={onClose}
                className="block p-3 border border-[#E4DFD5] bg-white hover:border-[#12110E]"
              >
                <span className="text-[10px] text-[#E85D2C] font-bold uppercase">OFF-DUTY</span>
                <h4 className="font-display font-black text-sm uppercase text-[#12110E]">Recovery Slides</h4>
              </Link>
            </div>
          )}

          {/* Direct links */}
          <div className="pt-4 border-t border-[#E4DFD5] space-y-3">
            <Link
              href="/shop?sort=newest"
              onClick={onClose}
              className="flex items-center justify-between font-display font-black text-sm uppercase text-[#12110E]"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E85D2C]" />
                New Arrivals
              </span>
              <span className="text-xs bg-[#E85D2C] text-white px-1.5 py-0.5 font-sans font-bold">
                HOT
              </span>
            </Link>
            <Link
              href="/shop?sale=true"
              onClick={onClose}
              className="flex items-center justify-between font-display font-black text-sm uppercase text-[#E85D2C]"
            >
              <span>Sale & Archive Drops</span>
              <span className="text-xs text-[#E85D2C] font-bold">UP TO 30% OFF</span>
            </Link>
          </div>
        </div>

        {/* Footer Utilities */}
        <div className="p-4 bg-white border-t border-[#E4DFD5] space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center justify-center gap-2 py-2.5 border border-[#E4DFD5] text-xs font-bold uppercase hover:border-black"
            >
              <Heart className="w-4 h-4 text-[#E85D2C]" />
              <span>Wishlist ({wishlistCount})</span>
            </Link>
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center justify-center gap-2 py-2.5 border border-[#E4DFD5] text-xs font-bold uppercase hover:border-black"
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </Link>
          </div>

          <a
            href="https://wa.me/919876543210?text=Hi%20Cally%20Wear,%20I'd%20like%20to%20inquire%20about%20footwear%20sizing%20and%20orders"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#12110E] text-white text-xs font-black uppercase tracking-wider hover:bg-black"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp Support / VIP Line</span>
          </a>
        </div>
      </div>
    </div>
  );
}
