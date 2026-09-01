"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Ruler,
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronDown,
  Sparkles,
  Zap,
  Check,
  AlertCircle
} from "lucide-react";
import { Product } from "@/lib/types/product";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { SizeGuideModal } from "@/components/product/size-guide-modal";

interface ProductInfoProps {
  product: Product;
  selectedColor: string;
  onColorChange: (colorName: string) => void;
}

export function ProductInfo({ product, selectedColor, onColorChange }: ProductInfoProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");
  const [isAdded, setIsAdded] = useState(false);

  const { addItem, openCart } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const isWishlisted = isInWishlist(product.id);
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize, selectedColor, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize, selectedColor, 1);
    router.push("/checkout");
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Category and Badges */}
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#E85D2C]">
            {product.category} • {product.subCategory}
          </span>
          {product.tags?.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-[#12110E] text-white px-2 py-0.5 font-black uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Product Title */}
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-[#12110E] leading-none">
          {product.name}
        </h1>

        {/* Product Craft & Batch Status */}
        <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-[#6B665F]">
          <span className="inline-flex items-center gap-1 bg-[#181714] text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#E85D2C]" />
            <span>Drop 04 Batch</span>
          </span>
          <span>•</span>
          <span className="text-[#12110E] font-bold uppercase tracking-wider text-[11px]">
            Original Silhouette
          </span>
          <span>•</span>
          <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">
            Ready to Ship
          </span>
        </div>
      </div>

      {/* Pricing */}
      <div className="p-4 bg-white border border-[#E4DFD5] space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="font-mono font-black text-2xl sm:text-3xl text-[#12110E]">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="font-mono text-base text-[#8C877E] line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          {discount && (
            <span className="text-xs font-black uppercase bg-[#FFF0EB] text-[#E85D2C] px-2 py-0.5 border border-[#E85D2C]">
              SAVE {discount}%
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#6B665F]">
          Inclusive of all taxes. Free Express Shipping across India on orders over ₹1,999.
        </p>
      </div>

      {/* Colorway Selection */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
          <span>
            Colorway: <strong className="text-[#12110E]">{selectedColor}</strong>
          </span>
          <span className="text-[#8C877E] font-normal font-sans">
            {product.colors.length} options
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {product.colors.map((color) => (
            <button
              key={color.name}
              onClick={() => onColorChange(color.name)}
              className={`flex items-center gap-2 px-3 py-2 border text-xs font-bold uppercase transition-all ${
                selectedColor === color.name
                  ? "border-[#12110E] bg-[#12110E] text-white shadow-md ring-1 ring-[#12110E]"
                  : "border-[#E4DFD5] bg-white text-[#12110E] hover:border-black"
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                style={{ backgroundColor: color.hex }}
              />
              <span>{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
          <span>
            Select Size (UK): <strong className="text-[#12110E]">{selectedSize}</strong>
          </span>
          <button
            onClick={() => setIsSizeGuideOpen(true)}
            className="flex items-center gap-1 text-[#E85D2C] hover:underline font-bold"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Size Guide</span>
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`py-3 text-center border font-mono font-bold text-xs uppercase transition-all ${
                selectedSize === size
                  ? "border-[#E85D2C] bg-[#12110E] text-white shadow-md ring-1 ring-[#E85D2C]"
                  : "border-[#E4DFD5] bg-white text-[#12110E] hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Stock Alert */}
        <div className="text-xs font-semibold flex items-center gap-1.5 pt-1">
          {product.stock <= 4 ? (
            <span className="text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Low Stock Alert — Only {product.stock} pairs remaining in this drop
            </span>
          ) : (
            <span className="text-emerald-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              In Stock & Ready for Immediate Dispatch
            </span>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-2.5 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 flex items-center justify-center gap-2 font-display font-black text-sm uppercase tracking-wider transition-all duration-300 ${
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
                <span>Add to Bag</span>
              </>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            className="w-full py-4 bg-[#E85D2C] hover:bg-[#D44E1F] text-white flex items-center justify-center gap-2 font-display font-black text-sm uppercase tracking-wider shadow-lg transition-colors"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Instant Checkout</span>
          </button>
        </div>

        {/* Wishlist Toggle Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`w-full py-2.5 border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-colors ${
            isWishlisted
              ? "border-[#E85D2C] bg-[#FFF0EB] text-[#E85D2C]"
              : "border-[#E4DFD5] bg-white text-[#12110E] hover:border-black"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-[#E85D2C]" : ""}`} />
          <span>{isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}</span>
        </button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 py-4 border-y border-[#E4DFD5] text-center">
        <div className="space-y-1">
          <Truck className="w-4 h-4 mx-auto text-[#E85D2C]" />
          <p className="text-[10px] font-black uppercase text-[#12110E]">Free Shipping</p>
          <p className="text-[9px] text-[#8C877E]">On orders &gt; ₹1,999</p>
        </div>
        <div className="space-y-1 border-x border-[#E4DFD5]">
          <RefreshCw className="w-4 h-4 mx-auto text-[#E85D2C]" />
          <p className="text-[10px] font-black uppercase text-[#12110E]">7-Day Returns</p>
          <p className="text-[9px] text-[#8C877E]">Doorstep exchange</p>
        </div>
        <div className="space-y-1">
          <ShieldCheck className="w-4 h-4 mx-auto text-[#E85D2C]" />
          <p className="text-[10px] font-black uppercase text-[#12110E]">100% Genuine</p>
          <p className="text-[9px] text-[#8C877E]">Verified materials</p>
        </div>
      </div>

      {/* Accordions */}
      <div className="border-t border-[#E4DFD5] divide-y divide-[#E4DFD5]">
        {/* Accordion 1: Description */}
        <div>
          <button
            type="button"
            id="accordion-btn-description"
            aria-expanded={openAccordion === "description"}
            aria-controls="accordion-panel-description"
            onClick={() => toggleAccordion("description")}
            className="w-full py-4 flex items-center justify-between font-display font-black text-sm uppercase text-[#12110E] text-left hover:text-[#E85D2C] transition-colors focus-visible:outline-2 focus-visible:outline-[#E85D2C]"
          >
            <span>Product Story & Silhouette</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === "description" ? "rotate-180 text-[#E85D2C]" : ""
              }`}
            />
          </button>
          <div
            id="accordion-panel-description"
            role="region"
            aria-labelledby="accordion-btn-description"
            hidden={openAccordion !== "description"}
            className="pb-4 text-xs text-[#6B665F] leading-relaxed space-y-2"
          >
            <p>{product.description}</p>
            {product.details && (
              <ul className="list-disc list-inside space-y-1 pt-1 text-[#12110E] font-medium">
                {product.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Accordion 2: Materials & Care */}
        <div>
          <button
            type="button"
            id="accordion-btn-materials"
            aria-expanded={openAccordion === "materials"}
            aria-controls="accordion-panel-materials"
            onClick={() => toggleAccordion("materials")}
            className="w-full py-4 flex items-center justify-between font-display font-black text-sm uppercase text-[#12110E] text-left hover:text-[#E85D2C] transition-colors focus-visible:outline-2 focus-visible:outline-[#E85D2C]"
          >
            <span>Materials & Care</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === "materials" ? "rotate-180 text-[#E85D2C]" : ""
              }`}
            />
          </button>
          <div
            id="accordion-panel-materials"
            role="region"
            aria-labelledby="accordion-btn-materials"
            hidden={openAccordion !== "materials"}
            className="pb-4 text-xs text-[#6B665F] leading-relaxed space-y-2"
          >
            <p>
              <strong className="text-[#12110E]">Composition:</strong> {product.materials || "Premium high-grade synthetic leather, rubber cupsole, EVA foam."}
            </p>
            <p>
              <strong className="text-[#12110E]">Care Guide:</strong> Wipe clean with a soft damp micro-fiber cloth. Avoid submerged soaking or direct artificial heat drying. Store in a cool dry space with shoe trees or tissue padding to preserve form.
            </p>
          </div>
        </div>

        {/* Accordion 3: Shipping & Returns */}
        <div>
          <button
            type="button"
            id="accordion-btn-shipping"
            aria-expanded={openAccordion === "shipping"}
            aria-controls="accordion-panel-shipping"
            onClick={() => toggleAccordion("shipping")}
            className="w-full py-4 flex items-center justify-between font-display font-black text-sm uppercase text-[#12110E] text-left hover:text-[#E85D2C] transition-colors focus-visible:outline-2 focus-visible:outline-[#E85D2C]"
          >
            <span>Shipping & 7-Day Doorstep Returns</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordion === "shipping" ? "rotate-180 text-[#E85D2C]" : ""
              }`}
            />
          </button>
          <div
            id="accordion-panel-shipping"
            role="region"
            aria-labelledby="accordion-btn-shipping"
            hidden={openAccordion !== "shipping"}
            className="pb-4 text-xs text-[#6B665F] leading-relaxed space-y-2"
          >
            <p>
              • <strong>Transit Timelines:</strong> Orders are dispatched within 24 hours from our Mumbai fulfillment hub. Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) are delivered within 2–3 business days. Rest of India arrives within 3–5 business days.
            </p>
            <p>
              • <strong>Doorstep Size Exchange:</strong> Ordered the wrong size? We provide free hassle-free pickup and replacement within 7 calendar days from delivery date.
            </p>
            <p>
              • <strong>Cash on Delivery:</strong> Available across 18,000+ PIN codes in India.
            </p>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Sticky Mobile Add to Bag Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-[#E4DFD5] flex items-center justify-between gap-3 z-30 shadow-xl">
        <div>
          <span className="text-[10px] text-[#8C877E] uppercase block font-semibold">Total Price</span>
          <span className="font-mono font-black text-base text-[#12110E]">{formatPrice(product.price)}</span>
        </div>
        <button
          onClick={handleAddToCart}
          className="flex-1 py-3 bg-[#E85D2C] hover:bg-[#D44E1F] text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Bag ({selectedSize})</span>
        </button>
      </div>
    </div>
  );
}
