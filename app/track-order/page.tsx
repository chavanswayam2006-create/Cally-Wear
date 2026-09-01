"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Truck, Search, Package, CheckCircle2, Clock, MapPin, AlertCircle } from "lucide-react";

interface ShipmentItem {
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface ShipmentData {
  orderNumber: string;
  status: string;
  createdAt: string;
  estimatedDelivery: string;
  trackingNumber: string;
  carrier: string;
  destination: {
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  items: ShipmentItem[];
  timeline: Array<{ status: string; completed: boolean }>;
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contactIdentifier, setContactIdentifier] = useState("");
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShipment(null);

    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          contact: contactIdentifier,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No matching shipment found. Please verify your order number and contact details.");
        setLoading(false);
        return;
      }

      setShipment(data.shipment);
      setLoading(false);
    } catch {
      setError("A network error occurred while looking up the shipment. Please try again.");
      setLoading(false);
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
                  Email or Phone (Verification) *
                </label>
                <input
                  type="text"
                  placeholder="name@email.com or +91..."
                  value={contactIdentifier}
                  onChange={(e) => setContactIdentifier(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? "Searching Dispatch Records..." : "Track Shipment Status"}</span>
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
        {shipment && (
          <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E4DFD5]">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-black text-xl uppercase text-[#12110E]">
                    Order #{shipment.orderNumber}
                  </h2>
                  <span className="text-[10px] font-bold uppercase bg-[#E8F8F0] text-emerald-700 px-2.5 py-0.5">
                    {shipment.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-[#8C877E] mt-0.5">
                  Courier: {shipment.carrier} • AWB: <span className="font-mono font-bold text-[#12110E]">{shipment.trackingNumber}</span>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-[#8C877E] block">Estimated Delivery</span>
                <span className="font-mono font-bold text-xs text-[#12110E]">{shipment.estimatedDelivery}</span>
              </div>
            </div>

            {/* Tracking Steps */}
            <div className="py-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#12110E] mb-4">
                Doorstep Tracking Timeline
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {shipment.timeline.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border space-y-1 ${
                      step.completed
                        ? "bg-[#FAF8F5] border-emerald-600 text-emerald-700"
                        : "bg-[#FAF8F5] border-[#E4DFD5] text-[#8C877E]"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 mx-auto" />
                    ) : (
                      <Clock className="w-5 h-5 mx-auto" />
                    )}
                    <span className="text-xs font-bold uppercase block">{step.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="pt-4 border-t border-[#E4DFD5]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#12110E] mb-3">
                Items in this Shipment
              </h3>
              <div className="divide-y divide-[#F2EDE4] space-y-3">
                {shipment.items.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
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
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination (Data Minimized: City, State, Country, Masked Pincode) */}
            <div className="pt-4 border-t border-[#E4DFD5] flex items-start gap-3 text-xs text-[#6B665F]">
              <MapPin className="w-4 h-4 text-[#E85D2C] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#12110E] block uppercase font-bold">Delivery Region</strong>
                <span>
                  {shipment.destination.city}, {shipment.destination.state}, {shipment.destination.country} ({shipment.destination.pincode})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
