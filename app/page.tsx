import React from "react";
import { HeroSlider } from "@/components/home/hero-slider";
import { NewArrivals } from "@/components/home/new-arrivals";
import { CategoryTiles } from "@/components/home/category-tiles";
import { TrendingSection } from "@/components/home/trending-section";
import { ScrollShowcase } from "@/components/home/scroll-showcase";
import { EditorialBlocks } from "@/components/home/editorial-blocks";
import { InstagramStrip } from "@/components/home/instagram-strip";

import { getNewArrivals, getBestSellers } from "@/lib/data/products";

export default function HomePage() {
  const newArrivals = getNewArrivals();
  const bestSellers = getBestSellers();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Full-Bleed Carousel */}
      <HeroSlider />

      {/* 2. New Arrivals Carousel */}
      <NewArrivals products={newArrivals} />

      {/* 3. Shop By Category Tiles */}
      <CategoryTiles />

      {/* 4. Trending Now Tabbed Grid (Best Sellers & Street Heat) */}
      <TrendingSection products={bestSellers} />

      {/* 5. Signature Scroll Showcase (Interactive Pinned 3D Deconstruction) */}
      <ScrollShowcase />

      {/* 6. Highsnobiety / END. Editorial Storytelling */}
      <EditorialBlocks />

      {/* 6. Instagram Visual Strip */}
      <InstagramStrip />


    </div>
  );
}
