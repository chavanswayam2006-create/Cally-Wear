"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ShoppingBag,
  ExternalLink,
  Truck,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useOrderStore } from "@/lib/store/order-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { formatPrice } from "@/lib/utils";

export default function AccountPage() {
  const { orders } = useOrderStore();
  const { items: wishlistItems } = useWishlistStore();
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "wishlist">("orders");

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Profile Header */}
        <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#12110E] text-white font-display font-black text-2xl flex items-center justify-center">
              AK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-2xl uppercase tracking-tight text-[#12110E]">
                  Alex Kapoor
                </h1>
                <span className="text-[10px] bg-[#E85D2C] text-white px-2 py-0.5 font-bold uppercase tracking-wider">
                  VIP MEMBER
                </span>
              </div>
              <p className="text-xs text-[#6B665F]">alex.streets@gmail.com • +91 98765 43210</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/account/login"
              className="px-4 py-2 border border-[#E4DFD5] text-xs font-bold uppercase text-[#8C877E] hover:border-black hover:text-black transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E4DFD5] mt-8 bg-white text-xs font-black uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "orders"
                ? "border-[#E85D2C] text-[#12110E] bg-[#FAF8F5]"
                : "border-transparent text-[#8C877E] hover:text-black"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`px-6 py-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "addresses"
                ? "border-[#E85D2C] text-[#12110E] bg-[#FAF8F5]"
                : "border-transparent text-[#8C877E] hover:text-black"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`px-6 py-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "wishlist"
                ? "border-[#E85D2C] text-[#12110E] bg-[#FAF8F5]"
                : "border-transparent text-[#8C877E] hover:text-black"
            }`}
          >
            <Heart className="w-4 h-4 text-[#E85D2C]" />
            <span>Wishlist ({wishlistItems.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="p-12 bg-white border border-[#E4DFD5] text-center space-y-4">
                  <Package className="w-12 h-12 text-[#8C877E] mx-auto" />
                  <h3 className="font-display font-black text-xl uppercase text-[#12110E]">
                    No Orders Placed Yet
                  </h3>
                  <p className="text-xs text-[#6B665F] max-w-sm mx-auto">
                    When you purchase kicks from our drops, your order status and doorstep tracking will show here.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#12110E] text-white text-xs font-black uppercase tracking-wider hover:bg-[#E85D2C] transition-colors"
                  >
                    <span>Browse Drops</span>
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white border border-[#E4DFD5] p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E4DFD5]">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-display font-black text-base uppercase text-[#12110E]">
                            Order #{order.orderNumber}
                          </span>
                          <span className="text-[10px] font-bold uppercase bg-[#E8F8F0] text-emerald-700 px-2 py-0.5">
                            {order.status}
                          </span>
                        </div>
                        <span className="text-xs text-[#8C877E]">
                          Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
                        </span>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-[#8C877E] block">Total Amount</span>
                        <span className="font-mono font-black text-base text-[#12110E]">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="divide-y divide-[#F2EDE4] space-y-3 pt-2">
                      {order.items.map((item) => (
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

                    {/* Footer tracking */}
                    <div className="pt-4 border-t border-[#E4DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-[#6B665F]">
                        <Truck className="w-4 h-4 text-[#E85D2C]" />
                        <span>Tracking: <strong className="text-[#12110E] font-mono">{order.trackingNumber}</strong></span>
                      </div>

                      <Link
                        href={`/checkout/confirmation?orderId=${order.orderNumber}`}
                        className="text-xs font-bold text-[#E85D2C] hover:underline flex items-center gap-1"
                      >
                        <span>View Tracking Timeline</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === "addresses" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#12110E] p-6 space-y-3 relative">
                <span className="absolute top-4 right-4 text-[10px] bg-[#12110E] text-white px-2 py-0.5 font-bold uppercase">
                  DEFAULT
                </span>
                <h3 className="font-display font-black text-sm uppercase text-[#12110E]">
                  Alex Kapoor
                </h3>
                <div className="text-xs text-[#6B665F] space-y-1">
                  <p>Flat 402, High Street Towers, Linking Road, Tower B</p>
                  <p>Mumbai, Maharashtra — 400050</p>
                  <p>Phone: +91 98765 43210</p>
                </div>
                <div className="pt-3 border-t border-[#E4DFD5] flex gap-3 text-xs font-bold uppercase">
                  <button className="text-[#E85D2C] hover:underline">Edit Address</button>
                </div>
              </div>
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === "wishlist" && (
            <div>
              {wishlistItems.length === 0 ? (
                <div className="p-12 bg-white border border-[#E4DFD5] text-center space-y-4">
                  <Heart className="w-12 h-12 text-[#8C877E] mx-auto" />
                  <h3 className="font-display font-black text-xl uppercase text-[#12110E]">
                    Your Wishlist is Empty
                  </h3>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#12110E] text-white text-xs font-black uppercase tracking-wider hover:bg-[#E85D2C] transition-colors"
                  >
                    <span>Browse Sneakers</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((product) => (
                    <div key={product.id} className="bg-white border border-[#E4DFD5] p-4 flex gap-4">
                      <div className="relative w-20 h-24 bg-[#F2EDE4] shrink-0 overflow-hidden">
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-display font-black text-sm uppercase text-[#12110E]">
                            {product.name}
                          </h4>
                          <p className="font-mono text-xs font-bold text-[#12110E] mt-0.5">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <Link
                          href={`/products/${product.slug}`}
                          className="text-xs font-bold text-[#E85D2C] hover:underline"
                        >
                          View Product →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
