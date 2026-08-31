import React, { Suspense } from "react";
import { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { products } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Shop All Sneakers & Footwear",
  description:
    "Browse the entire Cally Wear catalog of streetwear kicks, technical runners, retro low sneakers, and cloud slides.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-12 text-center text-xs uppercase font-mono">Loading Catalog...</div>}>
      <ShopView initialProducts={products} title="All Footwear & Drops" />
    </Suspense>
  );
}
