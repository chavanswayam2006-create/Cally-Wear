"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Tv,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  Flame,
  ExternalLink,
  X,
  Sparkles,
} from "lucide-react";
import { HeroShowcase } from "@/components/home/hero-showcase";
import { HeroSlideItem } from "@/components/home/hero-showcase/types";

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  sku: string;
  basePrice: number;
  salePrice: number | null;
  isOnSale: boolean;
  description?: string;
  images: Array<{ url: string }>;
}

export default function AdminHeroShowcasePage() {
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add / Edit Modal / Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formProductId, setFormProductId] = useState("");
  const [formEyebrowLabel, setFormEyebrowLabel] = useState("");
  const [formHeadlineOverride, setFormHeadlineOverride] = useState("");
  const [formDescriptionOverride, setFormDescriptionOverride] = useState("");
  const [formCtaPrimaryLabel, setFormCtaPrimaryLabel] = useState("");
  const [formCtaPrimaryLink, setFormCtaPrimaryLink] = useState("");
  const [formCtaSecondaryLabel, setFormCtaSecondaryLabel] = useState("");
  const [formCtaSecondaryLink, setFormCtaSecondaryLink] = useState("");
  const [formCutoutImageUrl, setFormCutoutImageUrl] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);

  // Selected slide ID for Live Preview
  const [previewSlideId, setPreviewSlideId] = useState<string | null>(null);

  // Fetch all slides & products
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [slidesRes, productsRes] = await Promise.all([
        fetch("/api/admin/hero-showcase"),
        fetch("/api/admin/products"),
      ]);

      if (!slidesRes.ok) throw new Error("Failed to load hero slides");
      if (!productsRes.ok) throw new Error("Failed to load products catalog");

      const slidesData = await slidesRes.json();
      const productsData = await productsRes.json();

      const loadedSlides: HeroSlideItem[] = slidesData.slides || [];
      setSlides(loadedSlides);
      setProducts(productsData.products || []);

      if (loadedSlides.length > 0 && !previewSlideId) {
        setPreviewSlideId(loadedSlides[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Selected Product for Current Form
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === formProductId) || products[0] || null;
  }, [products, formProductId]);

  const openCreateModal = () => {
    const firstProd = products[0];
    setIsEditing(true);
    setEditingId(null);
    setFormProductId(firstProd?.id || "");
    setFormEyebrowLabel("EXCLUSIVE DROP / STREET ICONS");
    setFormHeadlineOverride("");
    setFormDescriptionOverride("");
    setFormCtaPrimaryLabel(firstProd ? `Shop ${firstProd.name}` : "Shop Now");
    setFormCtaPrimaryLink(firstProd ? `/products/${firstProd.slug}` : "");
    setFormCtaSecondaryLabel("Men's Collection");
    setFormCtaSecondaryLink("/shop/men");
    setFormCutoutImageUrl("");
    setFormIsActive(true);
    setFormDisplayOrder(slides.length);
  };

  const openEditModal = (slide: HeroSlideItem) => {
    setIsEditing(true);
    setEditingId(slide.id);
    setFormProductId(slide.productId);
    setFormEyebrowLabel(slide.eyebrowLabel);
    setFormHeadlineOverride(slide.headlineOverride || "");
    setFormDescriptionOverride(slide.descriptionOverride || "");
    setFormCtaPrimaryLabel(slide.ctaPrimaryLabel);
    setFormCtaPrimaryLink(slide.ctaPrimaryLink || "");
    setFormCtaSecondaryLabel(slide.ctaSecondaryLabel || "");
    setFormCtaSecondaryLink(slide.ctaSecondaryLink || "");
    setFormCutoutImageUrl(slide.cutoutImageUrl || "");
    setFormIsActive(slide.isActive);
    setFormDisplayOrder(slide.displayOrder);
    setPreviewSlideId(slide.id);
  };

  const handleProductChange = (newProductId: string) => {
    setFormProductId(newProductId);
    const prod = products.find((p) => p.id === newProductId);
    if (prod && !formCtaPrimaryLabel) {
      setFormCtaPrimaryLabel(`Shop ${prod.name}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductId || !formEyebrowLabel.trim() || !formCtaPrimaryLabel.trim()) {
      setError("Please fill in all required fields (Product, Eyebrow, Primary CTA).");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        // Update existing
        const res = await fetch(`/api/admin/hero-showcase/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: formProductId,
            eyebrowLabel: formEyebrowLabel.trim().toUpperCase(),
            headlineOverride: formHeadlineOverride.trim() || null,
            descriptionOverride: formDescriptionOverride.trim() || null,
            ctaPrimaryLabel: formCtaPrimaryLabel.trim(),
            ctaPrimaryLink: formCtaPrimaryLink.trim() || null,
            ctaSecondaryLabel: formCtaSecondaryLabel.trim() || null,
            ctaSecondaryLink: formCtaSecondaryLink.trim() || null,
            cutoutImageUrl: formCutoutImageUrl.trim() || null,
            isActive: formIsActive,
            displayOrder: Number(formDisplayOrder),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update hero slide");
        }
        setSuccess("Hero slide updated successfully.");
      } else {
        // Create new
        const res = await fetch("/api/admin/hero-showcase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: formProductId,
            eyebrowLabel: formEyebrowLabel.trim().toUpperCase(),
            headlineOverride: formHeadlineOverride.trim() || null,
            descriptionOverride: formDescriptionOverride.trim() || null,
            ctaPrimaryLabel: formCtaPrimaryLabel.trim(),
            ctaPrimaryLink: formCtaPrimaryLink.trim() || null,
            ctaSecondaryLabel: formCtaSecondaryLabel.trim() || null,
            ctaSecondaryLink: formCtaSecondaryLink.trim() || null,
            cutoutImageUrl: formCutoutImageUrl.trim() || null,
            isActive: formIsActive,
            displayOrder: Number(formDisplayOrder),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create hero slide");
        }
        setSuccess("Hero slide created successfully.");
      }

      setIsEditing(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (slide: HeroSlideItem) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/hero-showcase/${slide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, isActive: !s.isActive } : s))
      );
      setSuccess(`Slide ${!slide.isActive ? "activated" : "deactivated"}.`);
    } catch (err: any) {
      setError(err.message || "Failed to toggle active state");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    setError("");
    setSuccess("");

    const currentSlide = slides[index];
    const targetSlide = slides[targetIndex];

    try {
      const res = await fetch("/api/admin/hero-showcase/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { id: currentSlide.id, displayOrder: targetSlide.displayOrder },
            { id: targetSlide.id, displayOrder: currentSlide.displayOrder },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");

      await loadData();
      setSuccess("Display order updated.");
    } catch (err: any) {
      setError(err.message || "Failed to update order");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this slide from the hero showcase?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/hero-showcase/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete slide");

      setSuccess("Hero slide removed successfully.");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete slide");
    }
  };

  // Preview Slide Construction for Live Preview Pane
  const livePreviewSlides: HeroSlideItem[] = useMemo(() => {
    if (isEditing) {
      // While editing, build dynamic preview slide from form fields
      const p = selectedProduct;
      const editingSlide: HeroSlideItem = {
        id: editingId || "live_preview_editing",
        productId: formProductId,
        displayOrder: formDisplayOrder,
        isActive: formIsActive,
        eyebrowLabel: formEyebrowLabel || "EXCLUSIVE DROP",
        headlineOverride: formHeadlineOverride || null,
        descriptionOverride: formDescriptionOverride || null,
        ctaPrimaryLabel: formCtaPrimaryLabel || "Shop Now",
        ctaPrimaryLink: formCtaPrimaryLink || null,
        ctaSecondaryLabel: formCtaSecondaryLabel || null,
        ctaSecondaryLink: formCtaSecondaryLink || null,
        cutoutImageUrl: formCutoutImageUrl || null,
        product: p
          ? {
              id: p.id,
              name: p.name,
              slug: p.slug,
              sku: p.sku,
              basePrice: p.basePrice,
              salePrice: p.salePrice,
              isOnSale: p.isOnSale,
              description: p.description,
              images: p.images,
            }
          : null,
      };
      return [editingSlide];
    }

    // Default: use the currently selected slide from the table
    const selected = slides.find((s) => s.id === previewSlideId);
    if (selected) return [selected];
    return slides.length > 0 ? [slides[0]] : [];
  }, [
    isEditing,
    editingId,
    formProductId,
    formDisplayOrder,
    formIsActive,
    formEyebrowLabel,
    formHeadlineOverride,
    formDescriptionOverride,
    formCtaPrimaryLabel,
    formCtaPrimaryLink,
    formCtaSecondaryLabel,
    formCtaSecondaryLink,
    formCutoutImageUrl,
    selectedProduct,
    slides,
    previewSlideId,
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24221D]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-wider text-white">
              Hero Showcase Manager
            </h1>
            <span className="px-2.5 py-1 bg-[#1C1A16] border border-[#2D2A24] text-[#E85D2C] text-xs font-mono font-bold tracking-widest uppercase">
              Cinematic Hero
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#99948D] mt-1">
            Curate and orchestrate the full-bleed sneaker hero showcase with 3D depth, layered typography, and custom editorial copy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2.5 bg-[#1C1A16] hover:bg-[#24221D] border border-[#2D2A24] text-xs font-bold uppercase tracking-wider text-[#FAF8F5] flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hero Slide</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-200 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError("")} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Management Table + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Slides Table & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#141310] border border-[#24221D] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#24221D] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Active Slides ({slides.filter((s) => s.isActive).length} / {slides.length})
                </h2>
                <span className="text-[11px] text-[#858077]">
                  Order determines autoplay sequence. Max 6 active slides recommended.
                </span>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-[#858077] flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#E85D2C]" />
                <span>Loading hero showcase slides...</span>
              </div>
            ) : slides.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#858077] space-y-3">
                <p>No hero slides configured. Homepage is using default fallback.</p>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-[#E85D2C] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Slide</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#24221D]">
                {slides.map((slide, index) => {
                  const prod = slide.product;
                  const thumb =
                    slide.cutoutImageUrl ||
                    prod?.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80";

                  const isSelectedForPreview = previewSlideId === slide.id;

                  return (
                    <div
                      key={slide.id}
                      className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                        isSelectedForPreview ? "bg-[#1C1A16]" : "hover:bg-[#181714]"
                      }`}
                    >
                      {/* Left: Reorder & Thumbnail */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        {/* Order Controls */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveOrder(index, "up")}
                            disabled={index === 0}
                            aria-label="Move slide up"
                            className="p-1 text-[#858077] hover:text-white disabled:opacity-30 transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono text-center font-bold text-[#E85D2C]">
                            0{index + 1}
                          </span>
                          <button
                            onClick={() => handleMoveOrder(index, "down")}
                            disabled={index === slides.length - 1}
                            aria-label="Move slide down"
                            className="p-1 text-[#858077] hover:text-white disabled:opacity-30 transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-[#0E0D0B] border border-[#2D2A24] shrink-0 flex items-center justify-center overflow-hidden">
                          <Image
                            src={thumb}
                            alt={slide.eyebrowLabel}
                            fill
                            className="object-contain p-1"
                          />
                        </div>

                        {/* Slide Info */}
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#E85D2C] tracking-wider uppercase truncate">
                              {slide.eyebrowLabel}
                            </span>
                          </div>

                          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight truncate">
                            {slide.headlineOverride || prod?.name || "Unnamed Slide"}
                          </h3>

                          <p className="text-[11px] text-[#858077] truncate max-w-xs sm:max-w-sm">
                            {slide.descriptionOverride || prod?.description || "No description"}
                          </p>

                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#24221D] text-[#FAF8F5]">
                              CTA: {slide.ctaPrimaryLabel}
                            </span>
                            {slide.ctaSecondaryLabel && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#24221D] text-[#FAF8F5]">
                                2nd: {slide.ctaSecondaryLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Active Toggle & Action Buttons */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Preview Select Button */}
                        <button
                          onClick={() => {
                            setPreviewSlideId(slide.id);
                            setIsEditing(false);
                          }}
                          aria-label="Preview slide"
                          className={`p-2 border transition-colors ${
                            isSelectedForPreview && !isEditing
                              ? "border-[#E85D2C] text-[#E85D2C] bg-[#E85D2C]/10"
                              : "border-[#2D2A24] text-[#858077] hover:text-white hover:bg-[#24221D]"
                          }`}
                          title="View in Live Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Active Toggle Switch */}
                        <button
                          onClick={() => handleToggleActive(slide)}
                          aria-label={slide.isActive ? "Deactivate slide" : "Activate slide"}
                          className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors ${
                            slide.isActive
                              ? "border-emerald-700 bg-emerald-950/60 text-emerald-400"
                              : "border-[#2D2A24] bg-[#1C1A16] text-[#858077]"
                          }`}
                        >
                          {slide.isActive ? "ACTIVE" : "PAUSED"}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(slide)}
                          aria-label="Edit slide"
                          className="p-2 bg-[#1C1A16] hover:bg-[#24221D] border border-[#2D2A24] text-[#FAF8F5] hover:text-[#E85D2C] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(slide.id)}
                          aria-label="Delete slide"
                          className="p-2 bg-[#1C1A16] hover:bg-red-950/60 border border-[#2D2A24] text-[#858077] hover:text-red-400 hover:border-red-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Preview & Form Pane (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Panel */}
          <div className="bg-[#141310] border border-[#24221D] overflow-hidden sticky top-6">
            <div className="p-4 border-b border-[#24221D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#E85D2C]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Live Showcase Preview
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#858077] uppercase">
                {isEditing ? "Editing Preview" : "Storefront Appearance"}
              </span>
            </div>

            {/* Live Component Render */}
            <div className="relative border-b border-[#24221D] bg-[#0E0D0B] overflow-hidden">
              <HeroShowcase
                initialSlides={livePreviewSlides}
                isPreview={true}
                activePreviewIndex={0}
                className="min-h-[380px] md:min-h-[420px]"
              />
            </div>

            <div className="p-4 bg-[#141310] text-[11px] text-[#858077] flex items-center justify-between">
              <span>Dual-layer 3D cutout positioning active</span>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="text-[#E85D2C] hover:underline flex items-center gap-1"
              >
                <span>View Live Storefront</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Slide Drawer / Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#141310] border border-[#2D2A24] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#24221D]">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#E85D2C]" />
                <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                  {editingId ? "Edit Hero Slide" : "Create Hero Slide"}
                </h2>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-[#858077] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Product Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Select Featured Product *
                </label>
                <select
                  value={formProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#2D2A24] text-xs text-white focus:outline-none focus:border-[#E85D2C]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — ₹{p.basePrice}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#858077]">
                  Product links and defaults will sync with this product.
                </p>
              </div>

              {/* Eyebrow Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Eyebrow Badge Label *
                </label>
                <input
                  type="text"
                  value={formEyebrowLabel}
                  onChange={(e) => setFormEyebrowLabel(e.target.value)}
                  placeholder="e.g. WOMEN'S STREETWEAR ICON or DROP 04"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#2D2A24] text-xs text-white uppercase focus:outline-none focus:border-[#E85D2C]"
                />
              </div>

              {/* Headline Override */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Headline Override (Optional)
                </label>
                <input
                  type="text"
                  value={formHeadlineOverride}
                  onChange={(e) => setFormHeadlineOverride(e.target.value)}
                  placeholder={`Fallback: ${selectedProduct?.name || "Product Name"}`}
                  className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#2D2A24] text-xs text-white uppercase focus:outline-none focus:border-[#E85D2C]"
                />
                <p className="text-[10px] text-[#858077]">
                  Leave empty to automatically use the product&apos;s name.
                </p>
              </div>

              {/* Description Override */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Description Override (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescriptionOverride}
                  onChange={(e) => setFormDescriptionOverride(e.target.value)}
                  placeholder={`Fallback: ${selectedProduct?.description || "Product description"}`}
                  className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#2D2A24] text-xs text-white focus:outline-none focus:border-[#E85D2C]"
                />
              </div>

              {/* CTA Pair */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5]">
                    Primary CTA Label *
                  </label>
                  <input
                    type="text"
                    value={formCtaPrimaryLabel}
                    onChange={(e) => setFormCtaPrimaryLabel(e.target.value)}
                    placeholder="e.g. Shop Apex"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#2D2A24] text-xs text-white focus:outline-none focus:border-[#E85D2C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5]">
                    Primary CTA Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={formCtaPrimaryLink}
                    onChange={(e) => setFormCtaPrimaryLink(e.target.value)}
                    placeholder={`Fallback: /products/${selectedProduct?.slug || "slug"}`}
                    className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#2D2A24] text-xs text-white focus:outline-none focus:border-[#E85D2C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5]">
                    Secondary CTA Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={formCtaSecondaryLabel}
                    onChange={(e) => setFormCtaSecondaryLabel(e.target.value)}
                    placeholder="e.g. Men's Collection"
                    className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#2D2A24] text-xs text-white focus:outline-none focus:border-[#E85D2C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5]">
                    Secondary CTA Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={formCtaSecondaryLink}
                    onChange={(e) => setFormCtaSecondaryLink(e.target.value)}
                    placeholder="e.g. /shop/men"
                    className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#2D2A24] text-xs text-white focus:outline-none focus:border-[#E85D2C]"
                  />
                </div>
              </div>

              {/* Cutout Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Cutout Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formCutoutImageUrl}
                  onChange={(e) => setFormCutoutImageUrl(e.target.value)}
                  placeholder="https://... (or leave blank to use product primary image)"
                  className="w-full px-3.5 py-2.5 bg-[#1C1A16] border border-[#2D2A24] text-xs text-white focus:outline-none focus:border-[#E85D2C]"
                />
                <p className="text-[10px] text-[#858077]">
                  Transparent cutout PNG recommended for the 3D overlapping depth effect.
                </p>
              </div>

              {/* Active Toggle & Order */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2D2A24] text-[#E85D2C] focus:ring-0"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Publish to Homepage Hero (Active)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#858077]">Display Order:</span>
                  <input
                    type="number"
                    min={0}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-16 px-2 py-1 bg-[#1C1A16] border border-[#2D2A24] text-xs text-white text-center"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#24221D] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-[#1C1A16] hover:bg-[#24221D] border border-[#2D2A24] text-xs font-bold uppercase tracking-wider text-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Slide"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
