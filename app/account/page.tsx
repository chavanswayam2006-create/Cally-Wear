"use client";

import React, { useState, useEffect } from "react";
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
  Lock,
  ArrowRight,
  Plus
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useOrderStore } from "@/lib/store/order-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { formatPrice } from "@/lib/utils";

export default function AccountPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout, checkSession } = useAuthStore();
  const { orders } = useOrderStore();
  const { items: wishlistItems } = useWishlistStore();
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "wishlist">("orders");

  useEffect(() => {
    checkSession().finally(() => {
      setMounted(true);
    });
  }, [checkSession]);

  // Server-side & initial client render: secure logged-out state (Zero PII leak)
  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-[75vh] bg-[#FAF8F5] flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md bg-white border border-[#E4DFD5] p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-[#12110E] text-[#E85D2C] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block">
              MEMBER PORTAL
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#12110E]">
              Account Sign In Required
            </h1>
            <p className="text-xs text-[#6B665F] leading-relaxed max-w-xs mx-auto">
              Please sign in to your Cally Wear member account to view your past orders, saved addresses, and VIP drop access.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/account/login"
              className="w-full py-3.5 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/account/register"
              className="w-full py-3.5 bg-white border border-[#12110E] hover:bg-[#FAF8F5] text-[#12110E] font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>Create Cally Account</span>
            </Link>
          </div>

          <div className="pt-6 border-t border-[#E4DFD5] text-xs text-[#6B665F] space-y-1">
            <p className="font-medium text-[#12110E]">Need to track an order as a guest?</p>
            <Link href="/track-order" className="text-[#E85D2C] font-bold hover:underline inline-flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              <span>Track with Order Number & Phone</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Member View
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CW";

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Profile Header */}
        <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#12110E] text-white font-display font-black text-2xl flex items-center justify-center">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-2xl uppercase tracking-tight text-[#12110E]">
                  {user.name}
                </h1>
                {user.isVip && (
                  <span className="text-[10px] bg-[#E85D2C] text-white px-2 py-0.5 font-bold uppercase tracking-wider">
                    VIP MEMBER
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B665F]">
                {user.email} {user.phone ? `• ${user.phone}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => logout()}
              className="px-4 py-2 border border-[#E4DFD5] text-xs font-bold uppercase text-[#8C877E] hover:border-black hover:text-black transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
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
                    When you purchase kicks from our drops, your order status and doorstep tracking will appear here.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#12110E] text-white text-xs font-black uppercase tracking-wider hover:bg-[#E85D2C] transition-colors"
                  >
                    <span>Browse Catalog</span>
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
                        <span>Tracking: <strong className="text-[#12110E] font-mono">{order.trackingNumber || `TRK-${order.orderNumber}`}</strong></span>
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
            <div className="space-y-4">
              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.addresses.map((addr) => (
                    <div key={addr.id} className="bg-white border border-[#12110E] p-6 space-y-3 relative">
                      {addr.isDefault && (
                        <span className="absolute top-4 right-4 text-[10px] bg-[#12110E] text-white px-2 py-0.5 font-bold uppercase">
                          DEFAULT
                        </span>
                      )}
                      <h3 className="font-display font-black text-sm uppercase text-[#12110E]">
                        {addr.name}
                      </h3>
                      <div className="text-xs text-[#6B665F] space-y-1">
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} — {addr.pincode}</p>
                        <p>Phone: {addr.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 bg-white border border-[#E4DFD5] text-center space-y-3">
                  <MapPin className="w-12 h-12 text-[#8C877E] mx-auto" />
                  <h3 className="font-display font-black text-base uppercase text-[#12110E]">
                    No Saved Addresses
                  </h3>
                  <p className="text-xs text-[#6B665F] max-w-sm mx-auto">
                    Addresses entered during checkout will automatically be saved to your profile for faster checkout.
                  </p>
                </div>
              )}
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
