"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Tag,
  Layers,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface SectionOption {
  id: string;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState("");
  const [basePrice, setBasePrice] = useState<number | "">(6999);
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [isOnSale, setIsOnSale] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("PUBLISHED");

  const [sections, setSections] = useState<SectionOption[]>([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);

  const [sizes, setSizes] = useState<Array<{ size: string; stock: number }>>([
    { size: "UK 7", stock: 15 },
    { size: "UK 8", stock: 20 },
    { size: "UK 9", stock: 18 },
    { size: "UK 10", stock: 12 },
  ]);

  const [images, setImages] = useState<Array<{ url: string; altText: string }>>([
    {
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      altText: "Lateral Profile",
    },
  ]);

  const [newImageUrl, setNewImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load available sections
  useEffect(() => {
    fetch("/api/sections")
      .then((res) => res.json())
      .then((data) => {
        if (data.sections) {
          setSections(data.sections);
          // Default select "New Arrivals" if found
          const newArrivals = data.sections.find((s: any) => s.slug === "new-arrivals");
          if (newArrivals) {
            setSelectedSectionIds([newArrivals.id]);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Auto-generate slug and SKU from name
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setSlug(generatedSlug);
    if (!sku) {
      const acronym = val
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 4);
      setSku(`CW-${acronym || "SNK"}-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleAddSize = () => {
    const nextSize = `UK ${7 + sizes.length}`;
    setSizes([...sizes, { size: nextSize, stock: 10 }]);
  };

  const handleRemoveSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, { url: newImageUrl.trim(), altText: `${name} view` }]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleSection = (id: string) => {
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Discount calculation preview
  const numBase = Number(basePrice) || 0;
  const numSale = Number(salePrice) || 0;
  const discountPercent =
    isOnSale && numSale && numBase > numSale
      ? Math.round(((numBase - numSale) / numBase) * 100)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !sku || !slug) {
      setError("Please fill in Name, Slug, and SKU");
      return;
    }

    if (sizes.length === 0) {
      setError("Please add at least one size variant with stock");
      return;
    }

    if (images.length === 0) {
      setError("Please add at least one product image");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name,
        slug,
        sku,
        description: description || `Handcrafted high-rotation footwear by Cally Wear.`,
        materials: materials || "Premium synthetic leather, EVA midsole, rubber outsole",
        basePrice: Number(basePrice),
        salePrice: salePrice ? Number(salePrice) : null,
        isOnSale,
        isFeatured,
        isNewArrival,
        status,
        sections: selectedSectionIds,
        sizes,
        images: images.map((img, idx) => ({
          url: img.url,
          altText: img.altText,
          sortOrder: idx,
        })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create product");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24221D] pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 bg-[#1C1A16] hover:bg-[#25231E] border border-[#2F2C26] text-[#99948D] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display font-black text-2xl uppercase tracking-tight text-white">
              Create New Footwear
            </h1>
            <p className="text-xs text-[#99948D] mt-0.5">
              Add a new sneaker, slide, or boot to the Cally Wear rotation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e: any) => setStatus(e.target.value)}
            className="px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs font-bold uppercase text-[#FAF8F5] focus:outline-none focus:border-[#E85D2C]"
          >
            <option value="PUBLISHED">Published (Live)</option>
            <option value="DRAFT">Draft (Hidden)</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Save Product"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Product Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white">
              Product Overview
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Tech Runner 2.0"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#282622] text-white text-xs focus:outline-none focus:border-[#E85D2C]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
                  SKU (Stock Keeping Unit) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="CW-SNK-009"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#282622] text-white text-xs font-mono uppercase focus:outline-none focus:border-[#E85D2C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="apex-tech-runner-2"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#282622] text-white text-xs font-mono focus:outline-none focus:border-[#E85D2C]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Engineered for high-intensity urban agility and concrete endurance..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#282622] text-white text-xs focus:outline-none focus:border-[#E85D2C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
                Materials & Construction
              </label>
              <input
                type="text"
                placeholder="Ripstop ballistic nylon, TPU cage, EVA foam midsole, Vibram rubber tread"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#282622] text-white text-xs focus:outline-none focus:border-[#E85D2C]"
              />
            </div>
          </div>

          {/* Pricing & Sale Configuration (Section 8) */}
          <div className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
            <div className="flex items-center justify-between border-b border-[#24221D] pb-3">
              <div>
                <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white">
                  Pricing & Sale Feature
                </h2>
                <p className="text-[11px] text-[#99948D]">
                  On Sale toggle is the single master switch controlling storefront badge & strikethrough.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5] cursor-pointer">
                  On Sale:
                </label>
                <input
                  type="checkbox"
                  checked={isOnSale}
                  onChange={(e) => setIsOnSale(e.target.checked)}
                  className="w-4 h-4 accent-[#E85D2C] cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
                  Base Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#282622] text-white text-xs font-display font-bold focus:outline-none focus:border-[#E85D2C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
                  Sale Price (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="Optional discounted price"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#282622] text-white text-xs font-display font-bold focus:outline-none focus:border-[#E85D2C]"
                />
              </div>
            </div>

            {/* Live Pricing Preview Rule Card */}
            <div className="p-3 bg-[#1C1A16] border border-[#282622] text-xs flex items-center justify-between">
              <span className="text-[#99948D]">Storefront Display Result:</span>
              <div>
                {isOnSale && salePrice ? (
                  <div className="inline-flex items-center gap-2">
                    <span className="text-[#E85D2C] font-display font-black text-sm">
                      ₹{salePrice}
                    </span>
                    <span className="line-through text-[#6B665F]">₹{basePrice}</span>
                    <span className="px-1.5 py-0.2 bg-orange-950 text-orange-400 text-[10px] font-mono font-bold">
                      -{discountPercent}% SALE
                    </span>
                  </div>
                ) : (
                  <span className="font-display font-bold text-white text-sm">
                    ₹{basePrice || 0} (Regular Price)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sizes & Inventory */}
          <div className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white">
                  Sizes & Inventory Stock
                </h2>
                <p className="text-[11px] text-[#99948D]">
                  Stock automatically decrements on orders and restores on cancellation.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSize}
                className="px-3 py-1.5 bg-[#1C1A16] hover:bg-[#25231E] border border-[#282622] text-[#FAF8F5] text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#E85D2C]" />
                <span>Add Size</span>
              </button>
            </div>

            <div className="space-y-2">
              {sizes.map((variant, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-[#1C1A16] border border-[#282622]"
                >
                  <input
                    type="text"
                    placeholder="Size name (e.g. UK 8)"
                    value={variant.size}
                    onChange={(e) => {
                      const updated = [...sizes];
                      updated[index].size = e.target.value;
                      setSizes(updated);
                    }}
                    className="flex-1 px-3 py-1.5 bg-[#141310] border border-[#282622] text-xs text-white"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#99948D]">Units:</span>
                    <input
                      type="number"
                      min={0}
                      value={variant.stock}
                      onChange={(e) => {
                        const updated = [...sizes];
                        updated[index].stock = parseInt(e.target.value, 10) || 0;
                        setSizes(updated);
                      }}
                      className="w-20 px-3 py-1.5 bg-[#141310] border border-[#282622] text-xs text-white font-mono text-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(index)}
                    className="p-1.5 text-[#99948D] hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Merchandising, Sections, and Images */}
        <div className="space-y-6">
          {/* Section Assignments (Section 5.1 & 8) */}
          <div className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Layers className="w-4 h-4 text-[#E85D2C]" />
              <h2 className="font-display font-bold text-sm uppercase tracking-wider">
                Section Curation
              </h2>
            </div>
            <p className="text-[11px] text-[#99948D] leading-relaxed">
              Check every section/drop this product should appear in. This is a deliberate manual curation control.
            </p>

            <div className="space-y-2 pt-2">
              {sections.map((sec) => (
                <label
                  key={sec.id}
                  className="flex items-center gap-3 p-2.5 bg-[#1C1A16] border border-[#282622] hover:border-[#38352F] cursor-pointer text-xs font-semibold text-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedSectionIds.includes(sec.id)}
                    onChange={() => toggleSection(sec.id)}
                    className="w-4 h-4 accent-[#E85D2C]"
                  />
                  <span>{sec.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Badges & Flags */}
          <div className="p-5 bg-[#141310] border border-[#24221D] space-y-3">
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E85D2C]" />
              <span>Badges & Promos</span>
            </h2>

            <label className="flex items-center gap-3 p-2 bg-[#1C1A16] border border-[#282622] text-xs text-white cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 accent-[#E85D2C]"
              />
              <span>Mark as New Arrival</span>
            </label>

            <label className="flex items-center gap-3 p-2 bg-[#1C1A16] border border-[#282622] text-xs text-white cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#E85D2C]"
              />
              <span>Highlight as Featured</span>
            </label>
          </div>

          {/* Product Images */}
          <div className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
            <div className="flex items-center gap-2 text-white">
              <ImageIcon className="w-4 h-4 text-[#E85D2C]" />
              <h2 className="font-display font-bold text-sm uppercase tracking-wider">
                Product Photography
              </h2>
            </div>

            <div className="space-y-2">
              <input
                type="url"
                placeholder="Paste Image URL (https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="w-full py-2 bg-[#24221D] hover:bg-[#2C2923] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Image URL</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group border border-[#282622] bg-[#1C1A16] h-24 overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt={img.altText}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/80 text-white hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/70 text-[9px] font-mono text-white">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
