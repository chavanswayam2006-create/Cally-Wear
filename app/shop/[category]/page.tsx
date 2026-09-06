import React, { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductsByCategory } from "@/lib/data/products";
import { ProductCategory } from "@/lib/types/product";
import { ShopView } from "@/components/shop/shop-view";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const lowerCat = category.toLowerCase();

  // Map lowercase string to canonical enum
  const categoryMap: Record<string, ProductCategory> = {
    sneakers: "SNEAKERS",
    slides: "SLIDES",
    boots: "BOOTS",
    sandals: "SANDALS",
    running: "RUNNING",
    streetwear: "STREETWEAR",
  };

  const categoryEnum = categoryMap[lowerCat];
  if (!categoryEnum) {
    return { title: "Footwear Catalog" };
  }

  // Fetch product count for this category from the canonical data layer
  const categoryProducts = await getProductsByCategory(categoryEnum);
  const productCount = categoryProducts.length;

  const title = categoryEnum === "SNEAKERS" ? "Men's Sneakers & Footwear" : "Women's Sneakers & Platform Shoes";
  const description = categoryEnum === "SNEAKERS"
    ? "Explore our curated collection of men's technical runners, retro low sneakers, high-tops, and slides."
    : "Explore our curated collection of women's chunky platform sneakers, clean court shoes, knit trainers, and mules.";

  return {
    title,
    description,
    alternates: {
      canonical: `/shop/${category.toLowerCase()}`,
    },
  };
}

export default async function ShopCategoryPage({ params }: Props) {
  const { category } = await params;
  const lowerCat = category.toLowerCase();

  // Map lowercase string to canonical enum
  const categoryMap: Record<string, ProductCategory> = {
    sneakers: "SNEAKERS",
    slides: "SLIDES",
    boots: "BOOTS",
    sandals: "SANDALS",
    running: "RUNNING",
    streetwear: "STREETWEAR",
  };

  const categoryEnum = categoryMap[lowerCat];
  if (!categoryEnum) {
    notFound();
  }

  const categoryProducts = await getProductsByCategory(categoryEnum);
  const title = lowerCat === "men" ? "Men's Footwear" : "Women's Footwear";
  const subtitle =
    lowerCat === "men"
      ? "Engineered for high-octane agility, asphalt endurance, and modern streetwear style."
      : "Sculpted elevations, minimalist silhouettes, and featherweight cushioned trainers.";
  const productCount = categoryProducts.length;

  return (
    <Suspense fallback={<div className="min-h-screen p-12 text-center text-xs uppercase font-mono">Loading Kicks...</div>}>
      <ShopView
        initialProducts={categoryProducts}
        title={title}
        subtitle={subtitle}
        productCount={productCount}
        defaultCategory={categoryEnum}
      />
    </Suspense>
  );
}