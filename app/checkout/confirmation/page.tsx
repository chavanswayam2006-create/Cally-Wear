"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Truck,
  Package,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  Home
} from "lucide-react";
import { useOrderStore } from "@/lib/store/order-store";
import { formatPrice } from "@/lib/utils";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { currentOrder, getOrderByNumber } = useOrderStore();

  const order = (orderId ? getOrderByNumber(orderId) : currentOrder) || currentOrder;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Card */}
        <div className="bg-white border border-[#E4DFD5] p-8 md:p-12 text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 bg-[#E85D2C] text-white flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-12 h-12" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block">
            PAYMENT & ORDER CONFIRMED
          </span>

          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#12110E]">
            Thank You For Your Order
          </h1>

          <p className="text-sm text-[#6B665F] max-w-lg mx-auto leading-relaxed">
            Your footwear order has been verified and logged with our Mumbai fulfillment warehouse. An SMS and email receipt with live tracking has been sent.
          </p>

          <div className="inline-flex items-center gap-3 p-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-mono">
            <span className="text-[#8C877E] uppercase font-bold">Order Number:</span>
            <strong className="text-base text-[#12110E]">{order?.orderNumber || "CW-84920"}</strong>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4DFD5]">
            <h3 className="font-display font-black text-base uppercase tracking-wider text-[#12110E]">
              Order Status & Dispatch Timeline
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-[#E8F8F0] px-2.5 py-1">
              STATUS: PROCESSING (DISPATCH IN 24H)
            </span>
          </div>

          {/* Progress Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3 bg-[#FAF8F5] border-l-4 border-[#25D366]">
              <span className="text-[10px] font-black uppercase text-[#25D366] block">Step 1</span>
              <p className="font-display font-black text-xs uppercase text-[#12110E] mt-0.5">
                Order Placed
              </p>
              <span className="text-[10px] text-[#8C877E]">Confirmed</span>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-l-4 border-[#E85D2C]">
              <span className="text-[10px] font-black uppercase text-[#E85D2C] block">Step 2</span>
              <p className="font-display font-black text-xs uppercase text-[#12110E] mt-0.5">
                Quality Inspection
              </p>
              <span className="text-[10px] text-[#8C877E]">In Progress (Mumbai Hub)</span>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-l-4 border-[#E4DFD5]">
              <span className="text-[10px] font-black uppercase text-[#8C877E] block">Step 3</span>
              <p className="font-display font-black text-xs uppercase text-[#8C877E] mt-0.5">
                Express Dispatch
              </p>
              <span className="text-[10px] text-[#8C877E]">Air Cargo</span>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-l-4 border-[#E4DFD5]">
              <span className="text-[10px] font-black uppercase text-[#8C877E] block">Step 4</span>
              <p className="font-display font-black text-xs uppercase text-[#8C877E] mt-0.5">
                Doorstep Delivery
              </p>
              <span className="text-[10px] text-[#8C877E]">Estimated 2–3 Days</span>
            </div>
          </div>
        </div>

        {/* Order Details & Summary */}
        {order && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Items */}
            <div className="md:col-span-7 bg-white border border-[#E4DFD5] p-6 space-y-4">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#12110E] pb-3 border-b border-[#E4DFD5]">
                Items In This Shipment ({order.items.length})
              </h3>
              <div className="divide-y divide-[#F2EDE4] space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-4">
                    <div className="relative w-16 h-20 bg-[#F2EDE4] border border-[#E4DFD5] overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-black text-sm uppercase text-[#12110E] truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#6B665F]">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-xs text-[#12110E]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#E4DFD5] space-y-1.5 text-xs text-[#6B665F]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-[#12110E]">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#E85D2C] font-semibold">
                    <span>Discount Applied</span>
                    <span className="font-mono">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#12110E]">
                    {order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-display font-black text-[#12110E] pt-2 border-t border-[#E4DFD5]">
                  <span>Total Paid</span>
                  <span className="font-mono text-lg text-[#E85D2C]">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Address & Payment info */}
            <div className="md:col-span-5 bg-white border border-[#E4DFD5] p-6 space-y-4">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#12110E] pb-3 border-b border-[#E4DFD5]">
                Delivery Coordinates
              </h3>
              <div className="text-xs text-[#6B665F] space-y-1 leading-relaxed">
                <p className="font-bold text-[#12110E]">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
                <p>Email: {order.shippingAddress.email}</p>
              </div>

              <div className="pt-3 border-t border-[#E4DFD5] space-y-1 text-xs">
                <span className="font-bold text-[#12110E] uppercase block">Payment Method</span>
                <p className="text-[#6B665F] font-mono">{order.paymentMethod}</p>
              </div>

              <div className="pt-3 border-t border-[#E4DFD5] space-y-1 text-xs">
                <span className="font-bold text-[#12110E] uppercase block">Tracking Reference</span>
                <p className="text-[#E85D2C] font-mono font-bold">{order.trackingNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/account"
            className="w-full sm:w-auto px-8 py-4 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors text-center"
          >
            View in My Account / Orders
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-4 bg-white border border-[#E4DFD5] hover:border-black text-[#12110E] font-display font-black text-xs uppercase tracking-wider transition-colors text-center"
          >
            Continue Exploring Drops
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-12 text-center text-xs uppercase font-mono">Loading confirmation...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
