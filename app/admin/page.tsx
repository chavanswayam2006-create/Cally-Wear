"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  Package,
  Layers,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StatsData {
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    pendingCodTotal: number;
    pendingCodCount: number;
    totalProducts: number;
    publishedProducts: number;
    totalCustomers: number;
  };
  statusCounts: Record<string, number>;
  lowStockVariants: Array<{
    productId: string;
    productName: string;
    productSku: string;
    size: string;
    stock: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load statistics");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-950/60 text-emerald-400 border-emerald-800";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-blue-950/60 text-blue-400 border-blue-800";
      case "CONFIRMED":
      case "PACKED":
        return "bg-amber-950/60 text-amber-400 border-amber-800";
      case "CANCELLED":
      case "RETURNED":
        return "bg-red-950/60 text-red-400 border-red-800";
      default:
        return "bg-[#25231E] text-[#C5C0B8] border-[#36322B]";
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#E85D2C] animate-spin" />
        <p className="text-xs text-[#99948D] uppercase tracking-wider font-semibold">
          Loading command center metrics...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-800 text-red-400 space-y-2">
        <h2 className="font-bold text-sm">Dashboard Error</h2>
        <p className="text-xs">{error}</p>
        <button
          onClick={loadStats}
          className="mt-2 px-3 py-1.5 bg-red-900 text-white text-xs font-bold uppercase tracking-wider"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24221D] pb-6">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
            Operations Command Center
          </h1>
          <p className="text-xs text-[#99948D] mt-1">
            Real-time fulfillment metrics, inventory risk monitoring, and payment reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadStats}
            className="px-3.5 py-2 bg-[#1C1A16] hover:bg-[#25231E] border border-[#2F2C26] text-xs font-semibold text-[#FAF8F5] flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#E85D2C]" />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-[#E85D2C] hover:bg-[#D44E1F] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            + New Product
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 bg-[#141310] border border-[#24221D] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#99948D]">
              Total Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-white">
            {formatPrice(data.metrics.totalRevenue)}
          </div>
          <p className="text-[11px] text-[#6B665F]">
            From {data.metrics.totalOrders} total confirmed orders
          </p>
        </div>

        {/* Pending COD Cash */}
        <div className="p-5 bg-[#141310] border border-[#24221D] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#99948D]">
              Pending COD Pipeline
            </span>
            <Clock className="w-4 h-4 text-[#E85D2C]" />
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-[#E85D2C]">
            {formatPrice(data.metrics.pendingCodTotal)}
          </div>
          <p className="text-[11px] text-[#99948D]">
            {data.metrics.pendingCodCount} orders awaiting doorstep cash collection
          </p>
        </div>

        {/* Live Catalog */}
        <div className="p-5 bg-[#141310] border border-[#24221D] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#99948D]">
              Active Catalog
            </span>
            <Package className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-white">
            {data.metrics.publishedProducts}{" "}
            <span className="text-sm font-normal text-[#6B665F]">
              / {data.metrics.totalProducts}
            </span>
          </div>
          <p className="text-[11px] text-[#6B665F]">
            Published and purchasable on storefront
          </p>
        </div>

        {/* Low Stock Risk */}
        <div className="p-5 bg-[#141310] border border-[#24221D] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#99948D]">
              Low-Stock Variants
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-amber-400">
            {data.lowStockVariants.length}
          </div>
          <p className="text-[11px] text-[#99948D]">
            Sizes with ≤ 10 units in stock
          </p>
        </div>
      </div>

      {/* Orders By Status Distribution */}
      <div className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-sm uppercase tracking-wider text-white">
            Order Pipeline by Status
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-[#E85D2C] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {Object.entries(data.statusCounts).map(([status, count]) => (
            <Link
              key={status}
              href={`/admin/orders?status=${status}`}
              className="p-3 bg-[#1A1815] border border-[#282622] hover:border-[#E85D2C] transition-colors space-y-1 block text-center"
            >
              <div className="text-[10px] font-mono uppercase text-[#99948D] truncate">
                {status.replace(/_/g, " ")}
              </div>
              <div className="font-display font-black text-lg text-white">
                {count}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table (2 Cols) */}
        <div className="lg:col-span-2 bg-[#141310] border border-[#24221D] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#24221D] pb-3">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-white">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-[#E85D2C] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <p className="text-xs text-[#6B665F] py-8 text-center">
              No orders placed yet. Test checkout on storefront to see live records here!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#24221D] text-[#6B665F] uppercase tracking-wider font-mono text-[10px]">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1D19]">
                  {data.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#1C1A16] transition-colors group cursor-pointer"
                    >
                      <td className="py-3 font-mono font-bold text-[#E85D2C]">
                        <Link href={`/admin/orders/${order.id}`}>
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3">
                        <p className="font-semibold text-white">
                          {order.customerName}
                        </p>
                        <p className="text-[10px] text-[#6B665F]">
                          {order.customerEmail}
                        </p>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-[#201E1A] border border-[#2E2B25] text-[10px] font-mono text-[#C5C0B8]">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 border text-[10px] font-mono font-semibold uppercase ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-display font-bold text-white">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts (1 Col) */}
        <div className="bg-[#141310] border border-[#24221D] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#24221D] pb-3">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Low-Stock Alerts</span>
            </h2>
            <Link
              href="/admin/products"
              className="text-xs text-[#E85D2C] hover:underline font-semibold"
            >
              Catalog
            </Link>
          </div>

          {data.lowStockVariants.length === 0 ? (
            <p className="text-xs text-[#6B665F] py-8 text-center">
              All sizes and variants are well-stocked.
            </p>
          ) : (
            <div className="space-y-3">
              {data.lowStockVariants.slice(0, 6).map((variant, idx) => (
                <div
                  key={`${variant.productId}-${variant.size}-${idx}`}
                  className="p-3 bg-[#1A1815] border border-[#282622] flex items-center justify-between"
                >
                  <div className="overflow-hidden pr-2">
                    <Link
                      href={`/admin/products/${variant.productId}/edit`}
                      className="text-xs font-bold text-white hover:text-[#E85D2C] truncate block"
                    >
                      {variant.productName}
                    </Link>
                    <p className="text-[10px] text-[#6B665F] font-mono">
                      {variant.productSku} • Size {variant.size}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`px-2 py-0.5 font-mono text-xs font-black ${
                        variant.stock <= 3
                          ? "bg-red-950 text-red-400 border border-red-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {variant.stock} left
                    </span>
                  </div>
                </div>
              ))}

              {data.lowStockVariants.length > 6 && (
                <p className="text-[11px] text-[#6B665F] text-center pt-2">
                  + {data.lowStockVariants.length - 6} more variants below threshold
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
