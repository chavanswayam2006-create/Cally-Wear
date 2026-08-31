import React, { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop/shop-view";
import { products, getProductsByCategory } from "@/lib/data/products";
import { ProductCategory } from "@/lib/types/product";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const isMen = category.toLowerCase() === "men";
  const isWomen = category.toLowerCase() === "women";

  if (!isMen && !isWomen) {
    return { title: "Footwear Catalog" };
  }

  const title = isMen ? "Men's Sneakers & Footwear" : "Women's Sneakers & Platform Shoes";
  const description = isMen
    ? "Explore our curated collection of men's technical runners, retro low sneakers, high-tops, and slides."
    : "Explore our curated collection of women's chunky platform sneakers, clean court shoes, knit trainers, and mules.";

  return {
    title,
    description,
  };
}

export default async function ShopCategoryPage({ params }: Props) {
  const { category } = await params;
  const lowerCat = category.toLowerCase();

  if (lowerCat !== "men" && lowerCat !== "women") {
    notFound();
  }

  const categoryProducts = getProductsByCategory(lowerCat as ProductCategory);
  const title = lowerCat === "men" ? "Men's Footwear" : "Women's Footwear";
  const subtitle =
    lowerCat === "men"
      ? "Engineered for high-octane agility, asphalt endurance, and modern streetwear style."
      : "Sculpted elevations, minimalist silhouettes, and featherweight cushioned trainers.";

  return (
    <Suspense fallback={<div className="min-h-screen p-12 text-center text-xs uppercase font-mono">Loading Kicks...</div>}>
      <ShopView
        initialProducts={categoryProducts}
        title={title}
        subtitle={subtitle}
        defaultCategory={lowerCat as ProductCategory}
      />
    </Suspense>
  );
}
