"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  itemCount: number;
  paymentMethod: string;
  paymentStatus: string;
  amountPaid: number;
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (paymentStatusFilter !== "ALL") params.set("paymentStatus", paymentStatusFilter);
      if (methodFilter !== "ALL") params.set("paymentMethod", methodFilter);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentStatusFilter, methodFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

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

  const getPaymentBadge = (status: string, method: string) => {
    if (status === "PAID") {
      return "bg-emerald-950/60 text-emerald-400 border-emerald-800";
    }
    if (status === "PENDING") {
      return method === "COD"
        ? "bg-amber-950/60 text-amber-400 border-amber-800"
        : "bg-yellow-950/60 text-yellow-400 border-yellow-800";
    }
    if (status === "REFUNDED") {
      return "bg-purple-950/60 text-purple-400 border-purple-800";
    }
    return "bg-red-950/60 text-red-400 border-red-800";
  };

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24221D] pb-6">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
            Order Fulfillment & Payments
          </h1>
          <p className="text-xs text-[#99948D] mt-1">
            Track orders, update shipping carriers, and manage COD & prepaid reconciliations.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 bg-[#1C1A16] hover:bg-[#25231E] border border-[#2F2C26] text-xs font-semibold text-[#FAF8F5] flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#E85D2C]" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-[#141310] border border-[#24221D] p-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-[#6B665F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number (CW-...) or customer email..."
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
            <option value="ALL">All Order Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURNED">Returned</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs text-[#FAF8F5] focus:outline-none focus:border-[#E85D2C]"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs text-[#FAF8F5] focus:outline-none focus:border-[#E85D2C]"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="COD">Cash On Delivery (COD)</option>
            <option value="PREPAID_MOCK">Prepaid (Card / UPI / NetBanking)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#141310] border border-[#24221D] overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#99948D] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#E85D2C]" />
            <span>Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-xs text-[#6B665F]">No orders found matching the filter criteria.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#24221D] text-[#6B665F] uppercase tracking-wider font-mono text-[10px] bg-[#11100D]">
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date Placed</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4">Tracking</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1D19]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#1C1A16] transition-colors">
                  {/* Order Number */}
                  <td className="py-3 px-4 font-mono font-bold text-[#E85D2C]">
                    <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{o.customerName}</p>
                    <p className="text-[10px] text-[#6B665F]">{o.customerEmail}</p>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 font-mono text-[11px] text-[#99948D]">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  {/* Items */}
                  <td className="py-3 px-4 font-mono text-white">
                    {o.itemCount} {o.itemCount === 1 ? "pair" : "pairs"}
                  </td>

                  {/* Total */}
                  <td className="py-3 px-4 font-display font-bold text-white">
                    {formatPrice(o.total)}
                  </td>

                  {/* Payment */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2 py-0.5 border text-[10px] font-mono font-bold uppercase ${getPaymentBadge(
                          o.paymentStatus,
                          o.paymentMethod
                        )}`}
                      >
                        {o.paymentStatus}
                      </span>
                      <p className="text-[10px] text-[#6B665F] font-mono">
                        {o.paymentMethod === "COD" ? "Cash On Delivery" : "Prepaid (Mock)"}
                      </p>
                    </div>
                  </td>

                  {/* Fulfillment Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 border text-[10px] font-mono font-bold uppercase ${getStatusBadge(
                        o.status
                      )}`}
                    >
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>

                  {/* Tracking */}
                  <td className="py-3 px-4 font-mono text-[11px]">
                    {o.trackingNumber ? (
                      <div className="space-y-0.5">
                        <span className="text-white font-bold">{o.trackingNumber}</span>
                        {o.carrier && (
                          <span className="block text-[10px] text-[#6B665F]">
                            via {o.carrier}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[#6B665F]">Not assigned</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="px-3 py-1.5 bg-[#201E1A] hover:bg-[#E85D2C] hover:text-white text-[#C5C0B8] text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
