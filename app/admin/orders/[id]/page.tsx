"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  CreditCard,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  DollarSign,
  Package,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Status update form
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Tracking update form
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("Delhivery Express");
  const [trackingUpdating, setTrackingUpdating] = useState(false);

  // Manual payment update form
  const [paymentAmount, setPaymentAmount] = useState<number | "">("");
  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentUpdating, setPaymentUpdating] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new Error("Failed to load order");
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
        setNewStatus(data.order.status);
        setTrackingNumber(data.order.trackingNumber || "");
        setCarrier(data.order.carrier || "Delhivery Express");
        setPaymentAmount(data.order.payment?.amountDue || data.order.total);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusUpdating(true);
    setError("");
    setActionSuccess("");

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote || `Status updated to ${newStatus} by admin`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setActionSuccess(data.message || "Order status updated");
      setStatusNote("");
      fetchOrder();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim() || !carrier.trim()) return;

    setTrackingUpdating(true);
    setError("");
    setActionSuccess("");

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/tracking`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
          carrier: carrier.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update tracking");

      setActionSuccess("Tracking credentials updated and published to customer account.");
      fetchOrder();
    } catch (err: any) {
      setError(err.message || "Failed to update tracking");
    } finally {
      setTrackingUpdating(false);
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentNote.trim()) {
      setError("Please provide an audit note describing the payment update.");
      return;
    }

    setPaymentUpdating(true);
    setError("");
    setActionSuccess("");

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          status: paymentStatus,
          note: paymentNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update payment");

      setActionSuccess("Payment update recorded and appended to audit log.");
      setPaymentNote("");
      fetchOrder();
    } catch (err: any) {
      setError(err.message || "Failed to update payment");
    } finally {
      setPaymentUpdating(false);
    }
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

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#E85D2C] animate-spin" />
        <p className="text-xs text-[#99948D] uppercase tracking-wider font-semibold">
          Loading order audit record...
        </p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-800 text-red-400 space-y-2">
        <h2 className="font-bold text-sm">Order Not Found</h2>
        <p className="text-xs">{error}</p>
        <Link
          href="/admin/orders"
          className="inline-block mt-3 px-3 py-1.5 bg-[#201E1A] text-white text-xs font-bold uppercase"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};

  return (
    <div className="space-y-8 max-w-6xl pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24221D] pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 bg-[#1C1A16] hover:bg-[#25231E] border border-[#2F2C26] text-[#99948D] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                {order.orderNumber}
              </h1>
              <span
                className={`px-2.5 py-0.5 border text-xs font-mono font-bold uppercase ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-[#99948D] mt-0.5">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrder}
          className="px-3.5 py-2 bg-[#1C1A16] hover:bg-[#25231E] border border-[#2F2C26] text-xs font-semibold text-[#FAF8F5] flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#E85D2C]" />
          <span>Reload Record</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Items, Shipping Snapshot, Audit Timelines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <div className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-[#E85D2C]" />
              <span>Purchased Line Items ({order.items?.length || 0})</span>
            </h2>

            <div className="divide-y divide-[#1F1D19]">
              {order.items?.map((item: any) => {
                const img =
                  item.product?.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";

                return (
                  <div key={item.id} className="py-3 flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#1C1A16] border border-[#282622] shrink-0 overflow-hidden">
                      <img
                        src={img}
                        alt={item.product?.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-xs truncate">
                        {item.product?.name || "Footwear Item"}
                      </p>
                      <p className="text-[11px] text-[#99948D] font-mono mt-0.5">
                        Size: <strong className="text-white">{item.variant?.size || "Standard"}</strong> • Qty: {item.quantity}
                      </p>
                      <p className="text-[10px] text-[#6B665F] font-mono">
                        SKU: {item.product?.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-white text-xs">
                        {formatPrice(item.priceAtPurchase * item.quantity)}
                      </p>
                      <p className="text-[10px] text-[#6B665F]">
                        {formatPrice(item.priceAtPurchase)} each
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Totals */}
            <div className="border-t border-[#24221D] pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#99948D]">
                <span>Subtotal:</span>
                <span className="font-mono text-white">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#99948D]">
                <span>Shipping Fee:</span>
                <span className="font-mono text-white">
                  {order.shippingFee === 0 ? "FREE" : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#1F1D19]">
                <span>Grand Total:</span>
                <span className="font-display font-black text-[#E85D2C] text-base">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Status History Timeline */}
          <div className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E85D2C]" />
              <span>OrderStatusEvent Audit Trail</span>
            </h2>
            <p className="text-[11px] text-[#6B665F]">
              Immutable log of every state change. Stock automatically restores when transitioned to CANCELLED.
            </p>

            <div className="relative pl-6 space-y-4 border-l border-[#282622] ml-2 pt-2">
              {order.statusHistory?.map((event: any, idx: number) => (
                <div key={event.id || idx} className="relative space-y-1">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-[#12110E] border-2 border-[#E85D2C] rounded-full" />
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#1C1A16] border border-[#282622] text-[10px] font-mono font-bold uppercase text-white">
                      {event.status}
                    </span>
                    <span className="text-[10px] text-[#6B665F] font-mono">
                      {new Date(event.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {event.note && (
                    <p className="text-xs text-[#C5C0B8]">{event.note}</p>
                  )}
                  <p className="text-[10px] text-[#6B665F]">
                    Logged by: <code className="text-[#99948D]">{event.updatedBy}</code>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Log Events Audit Trail */}
          <div className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#E85D2C]" />
              <span>PaymentLogEvent Audit Trail</span>
            </h2>
            <p className="text-[11px] text-[#6B665F]">
              Every payment collection, partial installment, or refund is appended with admin attribution.
            </p>

            {order.payment?.log?.length === 0 ? (
              <p className="text-xs text-[#6B665F]">No payment events logged yet.</p>
            ) : (
              <div className="relative pl-6 space-y-4 border-l border-[#282622] ml-2 pt-2">
                {order.payment?.log?.map((log: any, idx: number) => (
                  <div key={log.id || idx} className="relative space-y-1">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-[#12110E] border-2 border-emerald-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold uppercase">
                        {log.status}
                      </span>
                      <span className="font-mono font-bold text-xs text-white">
                        {formatPrice(log.amount)}
                      </span>
                      <span className="text-[10px] text-[#6B665F] font-mono">
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                    {log.note && (
                      <p className="text-xs text-[#C5C0B8]">{log.note}</p>
                    )}
                    <p className="text-[10px] text-[#6B665F]">
                      Source / Author: <code className="text-[#99948D]">{log.source}</code>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Controls, Shipping, Payment Mutation Forms */}
        <div className="space-y-6">
          {/* Customer & Shipping Address Snapshot */}
          <div className="p-5 bg-[#141310] border border-[#24221D] space-y-3">
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#E85D2C]" />
              <span>Customer Information</span>
            </h2>

            <div className="text-xs space-y-1 text-[#C5C0B8]">
              <p className="font-bold text-white text-sm">
                {shipping.firstName} {shipping.lastName}
              </p>
              <p>{shipping.email}</p>
              <p>{shipping.phone}</p>
            </div>

            <div className="pt-3 border-t border-[#1F1D19] text-xs space-y-1 text-[#99948D]">
              <div className="flex items-center gap-1.5 text-white font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#E85D2C]" />
                <span>Shipping Destination Snapshot:</span>
              </div>
              <p className="text-[#C5C0B8]">{shipping.address}</p>
              {shipping.apartment && <p>{shipping.apartment}</p>}
              <p>
                {shipping.city}, {shipping.state} - {shipping.pincode}
              </p>
              <p>{shipping.country || "India"}</p>
            </div>
          </div>

          {/* Action 1: Order Status Transition Form */}
          <form onSubmit={handleUpdateStatus} className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#E85D2C]" />
              <span>Update Order Status</span>
            </h2>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#99948D]">
                Next Lifecycle Stage
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs font-bold uppercase text-white focus:outline-none focus:border-[#E85D2C]"
              >
                <option value="PLACED">Placed</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PACKED">Packed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled (Restores Stock)</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#99948D]">
                Audit Note
              </label>
              <input
                type="text"
                placeholder="Reason or dispatch facility note..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={statusUpdating || newStatus === order.status}
              className="w-full py-2.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{statusUpdating ? "Updating..." : "Commit Status Change"}</span>
            </button>
          </form>

          {/* Action 2: Tracking Credentials Form */}
          <form onSubmit={handleUpdateTracking} className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#E85D2C]" />
              <span>Courier & Tracking</span>
            </h2>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#99948D]">
                Carrier Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Delhivery, Bluedart, DTDC"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#99948D]">
                Tracking Number (AWB)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DEL-IN-889102934"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs font-mono text-white"
              />
            </div>

            <button
              type="submit"
              disabled={trackingUpdating}
              className="w-full py-2.5 bg-[#1C1A16] hover:bg-[#25231E] border border-[#2F2C26] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-[#E85D2C]" />
              <span>{trackingUpdating ? "Saving..." : "Save Tracking Info"}</span>
            </button>
          </form>

          {/* Action 3: Manual Payment Reconciliation (Section 6) */}
          <form onSubmit={handleUpdatePayment} className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Manual Payment Reconciliation</span>
            </h2>

            <div className="p-3 bg-[#1C1A16] border border-[#282622] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#99948D]">Method:</span>
                <span className="font-mono text-white font-bold">{order.payment?.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#99948D]">Current Status:</span>
                <span className="font-mono text-emerald-400 font-bold">{order.payment?.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#99948D]">Amount Paid:</span>
                <span className="font-mono text-white font-bold">{formatPrice(order.payment?.amountPaid || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#99948D]">Amount Due:</span>
                <span className="font-mono text-white font-bold">{formatPrice(order.payment?.amountDue || order.total)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#99948D]">
                Resulting Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs font-bold uppercase text-white"
              >
                <option value="PAID">Mark As PAID (COD Collected / Settled)</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="REFUNDED">Refunded</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#99948D]">
                Amount Reconciled (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs font-mono font-bold text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#99948D]">
                Audit Note (Required) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cash collected by Bluedart agent at delivery"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C1A16] border border-[#282622] text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={paymentUpdating}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{paymentUpdating ? "Logging..." : "Record Payment Audit Entry"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
