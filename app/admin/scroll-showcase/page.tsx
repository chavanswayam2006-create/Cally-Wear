"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
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
  Layers,
  Cpu,
  ArrowRight,
  Flame,
} from "lucide-react";

interface ShowcaseItem {
  id: string;
  productId: string;
  displayOrder: number;
  isActive: boolean;
  overrideImageUrl: string | null;
  highlightLabel: string;
  highlightDescription: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    basePrice: number;
    salePrice: number | null;
    isOnSale: boolean;
    materials?: string;
    images?: Array<{ url: string }>;
  } | null;
}

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  salePrice: number | null;
  isOnSale: boolean;
  images: Array<{ url: string }>;
}

export default function AdminScrollShowcasePage() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add / Edit Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formProductId, setFormProductId] = useState("");
  const [formHighlightLabel, setFormHighlightLabel] = useState("");
  const [formHighlightDesc, setFormHighlightDesc] = useState("");
  const [formOverrideImageUrl, setFormOverrideImageUrl] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);

  // Selected item for Live Preview
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [showcaseRes, productsRes] = await Promise.all([
        fetch("/api/admin/scroll-showcase"),
        fetch("/api/admin/products"),
      ]);

      if (!showcaseRes.ok) throw new Error("Failed to load showcase chapters");
      if (!productsRes.ok) throw new Error("Failed to load products catalog");

      const showcaseData = await showcaseRes.json();
      const productsData = await productsRes.json();

      setItems(showcaseData.items || []);
      setProducts(productsData.products || []);

      if (showcaseData.items?.length > 0 && !previewItemId) {
        setPreviewItemId(showcaseData.items[0].id);
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

  const openCreateModal = () => {
    setIsEditing(true);
    setEditingId(null);
    setFormProductId(products[0]?.id || "");
    setFormHighlightLabel("AERODYNAMIC HEEL CHASSIS");
    setFormHighlightDesc("Precision molded carbon fiber stabilizer for rotational lock-in.");
    setFormOverrideImageUrl("");
    setFormIsActive(true);
    setFormDisplayOrder(items.length);
  };

  const openEditModal = (item: ShowcaseItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormProductId(item.productId);
    setFormHighlightLabel(item.highlightLabel);
    setFormHighlightDesc(item.highlightDescription);
    setFormOverrideImageUrl(item.overrideImageUrl || "");
    setFormIsActive(item.isActive);
    setFormDisplayOrder(item.displayOrder);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductId || !formHighlightLabel.trim() || !formHighlightDesc.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        // Update existing
        const res = await fetch(`/api/admin/scroll-showcase/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: formProductId,
            highlightLabel: formHighlightLabel.trim().toUpperCase(),
            highlightDescription: formHighlightDesc.trim(),
            overrideImageUrl: formOverrideImageUrl.trim() || null,
            isActive: formIsActive,
            displayOrder: Number(formDisplayOrder),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update chapter");
        }
        setSuccess("Showcase chapter updated successfully.");
      } else {
        // Create new
        const res = await fetch("/api/admin/scroll-showcase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: formProductId,
            highlightLabel: formHighlightLabel.trim().toUpperCase(),
            highlightDescription: formHighlightDesc.trim(),
            overrideImageUrl: formOverrideImageUrl.trim() || null,
            isActive: formIsActive,
            displayOrder: Number(formDisplayOrder),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create chapter");
        }
        setSuccess("Showcase chapter created successfully.");
      }

      setIsEditing(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: ShowcaseItem) => {
    try {
      const res = await fetch(`/api/admin/scroll-showcase/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isActive: !i.isActive } : i))
      );
    } catch (err: any) {
      setError(err.message || "Failed to toggle active state");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const currentItem = items[index];
    const targetItem = items[targetIndex];

    try {
      await Promise.all([
        fetch(`/api/admin/scroll-showcase/${currentItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayOrder: targetItem.displayOrder }),
        }),
        fetch(`/api/admin/scroll-showcase/${targetItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayOrder: currentItem.displayOrder }),
        }),
      ]);

      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update order");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this chapter from the showcase?")) return;

    try {
      const res = await fetch(`/api/admin/scroll-showcase/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete chapter");
      setSuccess("Chapter removed from showcase.");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete chapter");
    }
  };

  const activePreviewItem =
    items.find((i) => i.id === previewItemId) || items[0] || null;
  const previewProduct = activePreviewItem?.product;
  const previewImage =
    activePreviewItem?.overrideImageUrl ||
    previewProduct?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24221D] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#E85D2C] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Homepage Experience</span>
          </div>
          <h1 className="font-display font-black text-2xl uppercase tracking-tight text-white">
            Scroll Showcase Manager
          </h1>
          <p className="text-xs text-[#99948D] mt-1">
            Control the 3D pinned shoe presentation and sequential detail chapters rendered on the live storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-[#1C1A17] border border-[#2B2823] text-[#FAF8F5] hover:text-[#E85D2C] transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white font-display font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapter</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs flex items-center gap-3">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid: Chapters Table & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Chapters Sequence Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#C5C0B8]">
              Chapter Sequence ({items.length})
            </h2>
            <span className="text-[11px] text-[#6B665F]">
              Drag or use arrows to reorder timeline
            </span>
          </div>

          <div className="bg-[#141310] border border-[#24221D] divide-y divide-[#1F1D18]">
            {loading && items.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#6B665F]">
                Loading showcase chapters...
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-xs text-[#99948D]">
                  No chapters currently in the showcase.
                </p>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-[#E85D2C] text-white text-xs font-bold uppercase"
                >
                  Create First Chapter
                </button>
              </div>
            ) : (
              items.map((item, idx) => {
                const prod = item.product;
                const thumb =
                  item.overrideImageUrl ||
                  prod?.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";

                const isSelectedForPreview = previewItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                      isSelectedForPreview ? "bg-[#1E1C18]" : "hover:bg-[#181714]"
                    }`}
                  >
                    {/* Order & Reorder Controls */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveOrder(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-[#6B665F] hover:text-white disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono font-bold text-[#E85D2C]">
                        0{idx + 1}
                      </span>
                      <button
                        onClick={() => handleMoveOrder(idx, "down")}
                        disabled={idx === items.length - 1}
                        className="p-1 text-[#6B665F] hover:text-white disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-16 h-16 bg-[#0E0D0B] border border-[#2B2823] relative shrink-0 overflow-hidden">
                      <Image
                        src={thumb}
                        alt={prod?.name || "Product"}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#24221D] text-[#E85D2C] uppercase font-bold tracking-wider">
                          {item.highlightLabel}
                        </span>
                        {!item.isActive && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-400 uppercase">
                            Inactive
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">
                        {prod?.name || "Unassigned Product"}
                      </h4>
                      <p className="text-[11px] text-[#8C877E] line-clamp-1">
                        {item.highlightDescription}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
                          item.isActive ? "bg-[#E85D2C]" : "bg-zinc-800"
                        }`}
                        title={item.isActive ? "Deactivate" : "Activate"}
                      >
                        <div
                          className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                            item.isActive ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>

                      {/* Preview Button */}
                      <button
                        onClick={() => setPreviewItemId(item.id)}
                        className={`p-1.5 ${
                          isSelectedForPreview ? "text-[#E85D2C]" : "text-[#8C877E] hover:text-white"
                        }`}
                        title="View Live Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-[#8C877E] hover:text-white"
                        title="Edit Chapter"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-[#8C877E] hover:text-red-400"
                        title="Remove Chapter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Live Interactive Storefront Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#C5C0B8]">
              Live Storefront Preview
            </h2>
            <span className="text-[11px] font-mono text-[#E85D2C]">
              {activePreviewItem ? `CHAPTER 0${items.findIndex((i) => i.id === activePreviewItem.id) + 1}` : "NO SELECTION"}
            </span>
          </div>

          <div className="bg-[#0E0D0B] border border-[#2B2823] p-6 relative overflow-hidden flex flex-col justify-between min-h-[440px]">
            {/* Ambient Lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#E85D2C]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Preview Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-[#1C1A17] pb-3">
              <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#E85D2C] uppercase tracking-wider">
                <Flame className="w-3 h-3 fill-current" />
                <span>LAB SERIES // PREVIEW</span>
              </div>
              <span className="text-[10px] font-mono text-[#6B665F]">
                3D PINNED STAGE
              </span>
            </div>

            {/* Preview Shoe & Spec Layer */}
            <div className="relative z-10 my-6 flex flex-col items-center justify-center text-center space-y-3">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#181714] border border-[#2B2823] text-[10px] font-mono text-[#E85D2C] uppercase font-bold tracking-wider">
                <Cpu className="w-3 h-3" />
                <span>{activePreviewItem?.highlightLabel || "SELECT A CHAPTER"}</span>
              </div>

              {/* Title */}
              <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                {previewProduct?.name || "Apex Tech Runner"}
              </h3>

              {/* Shoe Image */}
              <div className="relative w-full h-44 my-2">
                <Image
                  src={previewImage}
                  alt={previewProduct?.name || "Preview"}
                  fill
                  className="object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Description */}
              <p className="text-xs text-[#99948D] max-w-xs mx-auto leading-relaxed">
                {activePreviewItem?.highlightDescription || "Select a chapter from the sequence to preview its live emergence copy."}
              </p>
            </div>

            {/* Preview Footer Action */}
            <div className="relative z-10 pt-3 border-t border-[#1C1A17] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#6B665F] uppercase block">
                  Price
                </span>
                <span className="text-xs font-bold text-white font-display">
                  ₹{(previewProduct?.basePrice || 7999).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="px-4 py-2 bg-[#E85D2C] text-white text-[10px] font-bold uppercase font-display tracking-wider flex items-center gap-1.5">
                <span>Shop Now</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Drawer Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181714] border border-[#2B2823] w-full max-w-xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#24221D] pb-4">
              <h3 className="font-display font-black text-lg uppercase text-white">
                {editingId ? "Edit Showcase Chapter" : "Add Showcase Chapter"}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-[#8C877E] hover:text-white font-mono uppercase"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Product Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
                  Associated Product *
                </label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#12110E] border border-[#2B2823] text-white text-xs font-medium focus:outline-none focus:border-[#E85D2C]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — ₹{p.basePrice.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Highlight Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
                  Highlight Spec / Material Label *
                </label>
                <input
                  type="text"
                  required
                  value={formHighlightLabel}
                  onChange={(e) => setFormHighlightLabel(e.target.value)}
                  placeholder="e.g. NITROGEN-INJECTED FOAM"
                  className="w-full px-3 py-2.5 bg-[#12110E] border border-[#2B2823] text-white text-xs font-medium uppercase focus:outline-none focus:border-[#E85D2C]"
                />
              </div>

              {/* Highlight Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
                  Chapter Story / Technical Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formHighlightDesc}
                  onChange={(e) => setFormHighlightDesc(e.target.value)}
                  placeholder="Detailed copy describing what emerges from underneath the silhouette..."
                  className="w-full px-3 py-2.5 bg-[#12110E] border border-[#2B2823] text-white text-xs font-medium focus:outline-none focus:border-[#E85D2C]"
                />
              </div>

              {/* Override Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
                  Custom Hero Angle Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formOverrideImageUrl}
                  onChange={(e) => setFormOverrideImageUrl(e.target.value)}
                  placeholder="https://... (Leave blank to use default primary product image)"
                  className="w-full px-3 py-2.5 bg-[#12110E] border border-[#2B2823] text-white text-xs font-medium focus:outline-none focus:border-[#E85D2C]"
                />
              </div>

              {/* Display Order & Active Toggle */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#12110E] border border-[#2B2823] text-white text-xs font-medium focus:outline-none focus:border-[#E85D2C]"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-3 cursor-pointer py-2.5">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 accent-[#E85D2C]"
                    />
                    <span className="text-xs font-bold uppercase text-white">
                      Active On Storefront
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#24221D]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-[#1C1A17] text-xs font-bold uppercase text-[#8C877E] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : editingId ? "Update Chapter" : "Create Chapter"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
