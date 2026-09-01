"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Truck, Search, Package, ArrowRight, ShieldCheck, CheckCircle2, Clock, MapPin, AlertCircle } from "lucide-react";
import { useOrderStore } from "@/lib/store/order-store";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/lib/types/product";

export default function TrackOrderPage() {
  const { getOrderByNumber } = useOrderStore();
  const [orderNumber, setOrderNumber] = useState("");
  const [contactIdentifier, setContactIdentifier] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setHasSearched(true);

    const cleanOrderNum = orderNumber.trim().toUpperCase().replace(/^#/, "");
    const found = getOrderByNumber(cleanOrderNum);

    if (found) {
      // Optional verification match against contact email or phone if provided
      if (contactIdentifier.trim()) {
        const queryContact = contactIdentifier.trim().toLowerCase();
        const matchesEmail = found.shippingAddress.email.toLowerCase() === queryContact;
        const matchesPhone = found.shippingAddress.phone.replace(/\D/g, "").includes(queryContact.replace(/\D/g, ""));

        if (!matchesEmail && !matchesPhone) {
          setError("Order found, but the provided email/phone does not match the delivery record. Please check details.");
          setSearchedOrder(null);
          return;
        }
      }
      setSearchedOrder(found);
    } else {
      setSearchedOrder(null);
      setError(`No active shipment found matching Order #${cleanOrderNum}. Please verify your order confirmation message.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block">
            GUEST SHIPMENT TRACKING
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#12110E]">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-[#6B665F] leading-relaxed">
            Enter your order number and contact detail below to check live dispatch status and transit updates.
          </p>
        </div>

        {/* Tracking Lookup Form */}
        <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                  Order Number *
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. CW-98241"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-mono uppercase focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                  Email or Phone (Verification)
                </label>
                <input
                  type="text"
                  placeholder="name@email.com or +91..."
                  value={contactIdentifier}
                  onChange={(e) => setContactIdentifier(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>Track Shipment Status</span>
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Card */}
        {searchedOrder && (
          <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E4DFD5]">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-black text-xl uppercase text-[#12110E]">
                    Order #{searchedOrder.orderNumber}
                  </h2>
                  <span className="text-[10px] font-bold uppercase bg-[#E8F8F0] text-emerald-700 px-2.5 py-0.5">
                    {searchedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-[#8C877E] mt-0.5">
                  Placed on {new Date(searchedOrder.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-[#8C877E] block">Estimated Delivery</span>
                <span className="font-mono font-bold text-xs text-[#12110E]">{searchedOrder.estimatedDelivery || "2-3 Business Days"}</span>
              </div>
            </div>

            {/* Tracking Steps */}
            <div className="py-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#12110E] mb-4">
                Doorstep Tracking Timeline
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-[#FAF8F5] border border-emerald-600 text-emerald-700 space-y-1">
                  <CheckCircle2 className="w-5 h-5 mx-auto" />
                  <span className="text-xs font-bold uppercase block">1. Confirmed</span>
                  <span className="text-[10px] text-[#6B665F] block font-mono">Verified</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-emerald-600 text-emerald-700 space-y-1">
                  <CheckCircle2 className="w-5 h-5 mx-auto" />
                  <span className="text-xs font-bold uppercase block">2. Packed</span>
                  <span className="text-[10px] text-[#6B665F] block font-mono">Mumbai Hub</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-[#E85D2C] text-[#E85D2C] space-y-1">
                  <Truck className="w-5 h-5 mx-auto animate-pulse" />
                  <span className="text-xs font-bold uppercase block">3. In Transit</span>
                  <span className="text-[10px] text-[#6B665F] block font-mono">Air Express</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-[#8C877E] space-y-1">
                  <Clock className="w-5 h-5 mx-auto" />
                  <span className="text-xs font-bold uppercase block">4. Delivery</span>
                  <span className="text-[10px] text-[#6B665F] block font-mono">Doorstep</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="pt-4 border-t border-[#E4DFD5]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#12110E] mb-3">
                Items in this Shipment
              </h3>
              <div className="divide-y divide-[#F2EDE4] space-y-3">
                {searchedOrder.items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 bg-[#F2EDE4] border border-[#E4DFD5] shrink-0 overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-display font-black text-xs uppercase text-[#12110E]">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-[#6B665F]">
                          Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-[#12110E]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            <div className="pt-4 border-t border-[#E4DFD5] flex items-start gap-3 text-xs text-[#6B665F]">
              <MapPin className="w-4 h-4 text-[#E85D2C] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#12110E] block uppercase font-bold">Delivery Address</strong>
                <span>
                  {searchedOrder.shippingAddress.firstName} {searchedOrder.shippingAddress.lastName} — {searchedOrder.shippingAddress.address}, {searchedOrder.shippingAddress.city}, {searchedOrder.shippingAddress.state} {searchedOrder.shippingAddress.pincode}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
