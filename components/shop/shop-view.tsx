"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, RotateCcw, ChevronDown, Check } from "lucide-react";
import { Product, ProductCategory } from "@/lib/types/product";
import { ProductGrid } from "@/components/product/product-grid";
import { formatPrice } from "@/lib/utils";

interface ShopViewProps {
  initialProducts: Product[];
  title?: string;
  subtitle?: string;
  defaultCategory?: ProductCategory | "all";
}

const subCategoriesList = [
  { id: "running", label: "Running & Performance" },
  { id: "streetwear", label: "Streetwear & High-Tops" },
  { id: "sneakers", label: "Retro & Court Lows" },
  { id: "basketball", label: "Basketball Mid" },
  { id: "slides", label: "Slides & Mules" },
];

const allSizes = ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"];

const colorPalette = [
  { name: "Black / Obsidian", hex: "#12110E" },
  { name: "White / Chalk", hex: "#FAF8F5" },
  { name: "Ember / Orange", hex: "#E85D2C" },
  { name: "Beige / Sand", hex: "#C4A482" },
  { name: "Olive / Army", hex: "#4B5320" },
  { name: "Grey / Slate", hex: "#7C7872" },
];

const priceRanges = [
  { id: "under-5000", label: "Under ₹5,000", min: 0, max: 5000 },
  { id: "5000-8000", label: "₹5,000 – ₹8,000", min: 5000, max: 8000 },
  { id: "8000-11000", label: "₹8,000 – ₹11,000", min: 8000, max: 11000 },
  { id: "above-11000", label: "Above ₹11,000", min: 11000, max: 999999 },
];

export function ShopView({
  initialProducts,
  title = "All Footwear",
  subtitle = "Explore our complete rotation of streetwear sneakers, performance runners, and recovery slides.",
  defaultCategory = "all",
}: ShopViewProps) {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const saleParam = searchParams.get("sale") === "true";

  // Filter States
  const [selectedGender, setSelectedGender] = useState<ProductCategory | "all">(defaultCategory);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onlySale, setOnlySale] = useState(saleParam);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest" | "discount">("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // Search query
    if (queryParam) {
      const q = queryParam.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Gender/Category
    if (selectedGender !== "all") {
      list = list.filter((p) => p.category === selectedGender || p.category === "unisex");
    }

    // Subcategories
    if (selectedSubCategories.length > 0) {
      list = list.filter((p) => selectedSubCategories.includes(p.subCategory));
    }

    // Sizes
    if (selectedSizes.length > 0) {
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }

    // Colors
    if (selectedColors.length > 0) {
      list = list.filter((p) =>
        p.colors.some((c) =>
          selectedColors.some((sc) => c.name.toLowerCase().includes(sc.split(" ")[0].toLowerCase()))
        )
      );
    }

    // Price range
    if (selectedPriceRange) {
      const range = priceRanges.find((r) => r.id === selectedPriceRange);
      if (range) {
        list = list.filter((p) => p.price >= range.min && p.price <= range.max);
      }
    }

    // In stock
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sale
    if (onlySale) {
      list = list.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "discount":
        list.sort((a, b) => {
          const discA = a.compareAtPrice ? ((a.compareAtPrice - a.price) / a.compareAtPrice) : 0;
          const discB = b.compareAtPrice ? ((b.compareAtPrice - b.price) / b.compareAtPrice) : 0;
          return discB - discA;
        });
        break;
      case "featured":
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }, [
    initialProducts,
    queryParam,
    selectedGender,
    selectedSubCategories,
    selectedSizes,
    selectedColors,
    selectedPriceRange,
    inStockOnly,
    onlySale,
    sortBy,
  ]);

  const activeFilterCount =
    (selectedGender !== "all" && defaultCategory === "all" ? 1 : 0) +
    selectedSubCategories.length +
    selectedSizes.length +
    selectedColors.length +
    (selectedPriceRange ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (onlySale ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedGender(defaultCategory);
    setSelectedSubCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedPriceRange(null);
    setInStockOnly(false);
    setOnlySale(false);
    setSortBy("featured");
  };

  const toggleSubCategory = (sub: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header Banner */}
      <div className="pb-8 border-b border-[#E4DFD5]">
        <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
          CALLY WEAR CATALOG
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#12110E]">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B665F] max-w-2xl mt-2 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Control Bar: Filters Trigger, Active Chips, Sort */}
      <div className="py-4 border-b border-[#E4DFD5] flex flex-wrap items-center justify-between gap-4">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-[#12110E] text-white text-xs font-black uppercase tracking-wider"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#E85D2C]" />
          <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
        </button>

        {/* Counter */}
        <div className="text-xs font-semibold text-[#6B665F]">
          Showing <strong className="text-[#12110E]">{filteredProducts.length}</strong> of {initialProducts.length} styles
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B665F] hidden sm:inline">
            Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white border border-[#E4DFD5] text-xs font-bold text-[#12110E] focus:outline-none focus:border-black uppercase font-mono"
          >
            <option value="featured">Featured / Curated</option>
            <option value="newest">New Releases First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="discount">Highest Discount</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="py-3 flex flex-wrap items-center gap-2 border-b border-[#E4DFD5]">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#8C877E] mr-1">
            Active:
          </span>

          {selectedGender !== "all" && defaultCategory === "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#12110E] text-white text-xs font-bold uppercase">
              {selectedGender}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-[#E85D2C]" onClick={() => setSelectedGender("all")} />
            </span>
          )}

          {selectedSubCategories.map((sub) => (
            <span key={sub} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#12110E] text-[#12110E] text-xs font-bold uppercase">
              {sub}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-[#E85D2C]" onClick={() => toggleSubCategory(sub)} />
            </span>
          ))}

          {selectedSizes.map((size) => (
            <span key={size} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#12110E] text-[#12110E] text-xs font-bold uppercase font-mono">
              {size}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-[#E85D2C]" onClick={() => toggleSize(size)} />
            </span>
          ))}

          {selectedColors.map((color) => (
            <span key={color} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#12110E] text-[#12110E] text-xs font-bold uppercase">
              {color}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-[#E85D2C]" onClick={() => toggleColor(color)} />
            </span>
          ))}

          {selectedPriceRange && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#12110E] text-[#12110E] text-xs font-bold uppercase">
              {priceRanges.find((r) => r.id === selectedPriceRange)?.label}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-[#E85D2C]" onClick={() => setSelectedPriceRange(null)} />
            </span>
          )}

          {onlySale && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E85D2C] text-white text-xs font-bold uppercase">
              On Sale
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setOnlySale(false)} />
            </span>
          )}

          <button
            onClick={resetAllFilters}
            className="text-xs font-bold text-[#E85D2C] hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar (Desktop) + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white border border-[#E4DFD5] p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DFD5]">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#12110E]">
                Filters
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-[#E85D2C] hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Gender / Category */}
            {defaultCategory === "all" && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#12110E]">
                  Gender / Division
                </h4>
                <div className="space-y-1 text-xs">
                  {["all", "men", "women"].map((g) => (
                    <label
                      key={g}
                      className="flex items-center gap-2 cursor-pointer py-1 text-[#4A4742] hover:text-black uppercase font-medium"
                    >
                      <input
                        type="radio"
                        name="gender"
                        checked={selectedGender === g}
                        onChange={() => setSelectedGender(g as any)}
                        className="accent-[#E85D2C]"
                      />
                      <span>{g === "all" ? "All Footwear" : `${g}'s Collection`}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sub Categories */}
            <div className="space-y-2 pt-4 border-t border-[#E4DFD5]">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#12110E]">
                Category
              </h4>
              <div className="space-y-1.5 text-xs">
                {subCategoriesList.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex items-center justify-between cursor-pointer py-0.5 text-[#4A4742] hover:text-black"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSubCategories.includes(sub.id)}
                        onChange={() => toggleSubCategory(sub.id)}
                        className="accent-[#E85D2C]"
                      />
                      <span className="font-medium">{sub.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-2 pt-4 border-t border-[#E4DFD5]">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#12110E]">
                Size (UK)
              </h4>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {allSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`py-1.5 text-xs font-mono font-bold uppercase border transition-all ${
                      selectedSizes.includes(size)
                        ? "border-[#E85D2C] bg-[#12110E] text-white"
                        : "border-[#E4DFD5] bg-[#FAF8F5] text-[#12110E] hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colorways */}
            <div className="space-y-2 pt-4 border-t border-[#E4DFD5]">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#12110E]">
                Colorway
              </h4>
              <div className="space-y-1.5 text-xs">
                {colorPalette.map((color) => (
                  <label
                    key={color.name}
                    className="flex items-center gap-2.5 cursor-pointer py-1 text-[#4A4742] hover:text-black"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color.name)}
                      onChange={() => toggleColor(color.name)}
                      className="accent-[#E85D2C]"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="font-medium">{color.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2 pt-4 border-t border-[#E4DFD5]">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#12110E]">
                Price Range
              </h4>
              <div className="space-y-1 text-xs">
                {priceRanges.map((range) => (
                  <label
                    key={range.id}
                    className="flex items-center gap-2 cursor-pointer py-1 text-[#4A4742] hover:text-black"
                  >
                    <input
                      type="radio"
                      name="price-range"
                      checked={selectedPriceRange === range.id}
                      onChange={() =>
                        setSelectedPriceRange(selectedPriceRange === range.id ? null : range.id)
                      }
                      className="accent-[#E85D2C]"
                    />
                    <span className="font-medium">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-4 border-t border-[#E4DFD5]">
              <label className="flex items-center justify-between cursor-pointer text-xs font-bold uppercase text-[#12110E]">
                <span>In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-[#E85D2C] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs font-bold uppercase text-[#E85D2C]">
                <span>Sale Items Only</span>
                <input
                  type="checkbox"
                  checked={onlySale}
                  onChange={(e) => setOnlySale(e.target.checked)}
                  className="accent-[#E85D2C] w-4 h-4"
                />
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-9">
          <ProductGrid
            products={filteredProducts}
            emptyMessage="No sneaker silhouettes match the selected filters. Try clearing some criteria."
            onResetFilters={resetAllFilters}
          />
        </div>
      </div>

      {/* Mobile Filter Sheet / Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-[#FAF8F5] text-[#12110E] h-full flex flex-col z-10 shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-[#E4DFD5] bg-white flex items-center justify-between">
              <h3 className="font-display font-black text-lg uppercase text-[#12110E]">
                Filter Catalog
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-[#12110E] hover:text-[#E85D2C]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-6">
              {/* Category */}
              <div>
                <h4 className="text-xs font-black uppercase text-[#12110E] mb-2">Category</h4>
                <div className="space-y-2 text-xs">
                  {subCategoriesList.map((sub) => (
                    <label key={sub.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedSubCategories.includes(sub.id)}
                        onChange={() => toggleSubCategory(sub.id)}
                        className="accent-[#E85D2C]"
                      />
                      <span>{sub.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-xs font-black uppercase text-[#12110E] mb-2">Size (UK)</h4>
                <div className="grid grid-cols-3 gap-2">
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`py-2 text-xs font-mono font-bold uppercase border ${
                        selectedSizes.includes(size)
                          ? "bg-[#12110E] text-white border-[#E85D2C]"
                          : "bg-white text-black border-[#E4DFD5]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-xs font-black uppercase text-[#12110E] mb-2">Price Range</h4>
                <div className="space-y-2 text-xs">
                  {priceRanges.map((range) => (
                    <label key={range.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="mob-price"
                        checked={selectedPriceRange === range.id}
                        onChange={() => setSelectedPriceRange(range.id)}
                        className="accent-[#E85D2C]"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 bg-white border-t border-[#E4DFD5] flex gap-3">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-3 border border-[#E4DFD5] text-xs font-bold uppercase hover:border-black"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#E85D2C] text-white text-xs font-black uppercase tracking-wider"
              >
                Show ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
