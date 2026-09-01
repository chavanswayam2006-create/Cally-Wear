import React, { Suspense } from "react";
import { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { products } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Shop All Sneakers & Footwear",
  description:
    "Browse the entire Cally Wear catalog of streetwear kicks, technical runners, retro low sneakers, and cloud slides.",
  alternates: {
    canonical: "/shop",
  },
};

function CatalogSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse space-y-8">
      <div className="space-y-3 pb-8 border-b border-[#E4DFD5]">
        <div className="h-4 w-32 bg-[#E4DFD5]" />
        <div className="h-10 w-64 bg-[#E4DFD5]" />
        <div className="h-4 w-96 bg-[#E4DFD5]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 6, 7].map((i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[4/5] bg-[#E4DFD5]" />
            <div className="h-4 w-3/4 bg-[#E4DFD5]" />
            <div className="h-4 w-1/4 bg-[#E4DFD5]" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ShopPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = searchParams ? await searchParams : {};
  const isSale = params.sale === "true";
  const initialSort = typeof params.sort === "string" ? (params.sort as any) : "featured";
  const initialQuery = typeof params.q === "string" ? params.q : "";
  const initialCategory = typeof params.category === "string" ? params.category : "";

  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <ShopView
        initialProducts={products}
        title={isSale ? "Archive Sale & Markdown Drops" : "All Footwear & Drops"}
        initialSale={isSale}
        initialSort={initialSort}
        initialQuery={initialQuery}
        initialCategory={initialCategory}
      />
    </Suspense>
  );
}
