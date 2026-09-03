"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  UploadCloud,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  RefreshCw,
  Eye,
  Tag,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string;
  basePrice: number;
  salePrice: number | null;
  isOnSale: boolean;
  discountPercent: number | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  isNewArrival: boolean;
  totalStock: number;
  sectionNames: string[];
  images: Array<{ url: string }>;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [saleFilter, setSaleFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (saleFilter === "ON_SALE") params.set("onSale", "true");
      if (saleFilter === "REGULAR") params.set("onSale", "false");
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, saleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete/archive "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Product removed");
        fetchProducts();
      } else {
        alert(data.error || "Failed to remove product");
      }
    } catch (err) {
      alert("Error deleting product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24221D] pb-6">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
            Product Catalog
          </h1>
          <p className="text-xs text-[#99948D] mt-1">
            Manage your footwear inventory, pricing, On Sale status, and section curation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/bulk-import"
            className="px-3.5 py-2 bg-[#1C1A16] hover:bg-[#25231E] border border-[#2F2C26] text-xs font-semibold text-[#FAF8F5] flex items-center gap-2 transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-[#E85D2C]" />
            <span>Bulk Import</span>
          </Link>

          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-[#E85D2C] hover:bg-[#D44E1F] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-[#141310] border border-[#24221D] p-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-[#6B665F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1C1A16] border border-[#282622] text-white text-xs placeholder:text-[#6B665F] focus:outline-none focus:border-[#E85D2C]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs text-[#FAF8F5] focus:outline-none focus:border-[#E85D2C]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Sale Filter */}
          <select
            value={saleFilter}
            onChange={(e) => setSaleFilter(e.target.value)}
            className="px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs text-[#FAF8F5] focus:outline-none focus:border-[#E85D2C]"
          >
            <option value="ALL">All Pricing</option>
            <option value="ON_SALE">On Sale Only</option>
            <option value="REGULAR">Regular Price</option>
          </select>

          <button
            onClick={fetchProducts}
            className="p-2 bg-[#1C1A16] hover:bg-[#25231E] border border-[#282622] text-[#99948D] hover:text-white"
            title="Reload table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141310] border border-[#24221D] overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#99948D] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#E85D2C]" />
            <span>Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-xs text-[#6B665F]">No products match the selected filters.</p>
            <Link
              href="/admin/products/new"
              className="inline-block px-4 py-2 bg-[#E85D2C] text-white text-xs font-bold uppercase"
            >
              Create First Product
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#24221D] text-[#6B665F] uppercase tracking-wider font-mono text-[10px] bg-[#11100D]">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Base / Sale Price</th>
                <th className="py-3 px-4">Sale Badge</th>
                <th className="py-3 px-4">Sections</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1D19]">
              {products.map((p) => {
                const img = p.images?.[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";

                return (
                  <tr key={p.id} className="hover:bg-[#1C1A16] transition-colors">
                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1C1A16] border border-[#282622] shrink-0 overflow-hidden relative">
                          <img
                            src={img}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="font-bold text-white hover:text-[#E85D2C] transition-colors"
                          >
                            {p.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            {p.isFeatured && (
                              <span className="text-[9px] font-mono text-[#E85D2C] uppercase">
                                ★ Featured
                              </span>
                            )}
                            {p.isNewArrival && (
                              <span className="text-[9px] font-mono text-emerald-400 uppercase">
                                • New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-4 font-mono font-semibold text-[#99948D]">
                      {p.sku}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <div className="font-display font-bold text-white">
                        {p.isOnSale && p.salePrice ? (
                          <div className="space-y-0.5">
                            <span className="text-[#E85D2C]">
                              {formatPrice(p.salePrice)}
                            </span>
                            <span className="block text-[10px] text-[#6B665F] line-through font-normal">
                              {formatPrice(p.basePrice)}
                            </span>
                          </div>
                        ) : (
                          <span>{formatPrice(p.basePrice)}</span>
                        )}
                      </div>
                    </td>

                    {/* Sale Badge */}
                    <td className="py-3 px-4">
                      {p.isOnSale ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-950/60 border border-orange-800 text-orange-400 text-[10px] font-mono font-bold uppercase">
                          <Tag className="w-3 h-3" />
                          <span>ON SALE {p.discountPercent ? `-${p.discountPercent}%` : ""}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#6B665F]">Off</span>
                      )}
                    </td>

                    {/* Sections */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {p.sectionNames?.length > 0 ? (
                          p.sectionNames.map((sec) => (
                            <span
                              key={sec}
                              className="px-1.5 py-0.5 bg-[#201E1A] border border-[#2E2B25] text-[10px] text-[#C5C0B8]"
                            >
                              {sec}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#6B665F]">None</span>
                        )}
                      </div>
                    </td>

                    {/* Total Stock */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono font-bold text-xs ${
                          p.totalStock <= 10
                            ? "text-amber-400"
                            : p.totalStock === 0
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {p.totalStock} units
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                          p.status === "PUBLISHED"
                            ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                            : p.status === "DRAFT"
                            ? "bg-[#25231E] text-[#99948D] border-[#36322B]"
                            : "bg-red-950/60 text-red-400 border-red-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === "PUBLISHED" && (
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            title="View on storefront"
                            className="p-1.5 text-[#99948D] hover:text-white hover:bg-[#201E1A]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          title="Edit product"
                          className="p-1.5 text-[#99948D] hover:text-[#E85D2C] hover:bg-[#201E1A]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deletingId === p.id}
                          title="Archive / Delete"
                          className="p-1.5 text-[#99948D] hover:text-red-400 hover:bg-[#201E1A] disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
