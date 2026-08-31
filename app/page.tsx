import React from "react";
import { HeroSlider } from "@/components/home/hero-slider";
import { NewArrivals } from "@/components/home/new-arrivals";
import { CategoryTiles } from "@/components/home/category-tiles";
import { TrendingSection } from "@/components/home/trending-section";
import { EditorialBlocks } from "@/components/home/editorial-blocks";
import { InstagramStrip } from "@/components/home/instagram-strip";
import { NewsletterBand } from "@/components/home/newsletter-band";
import { products, getNewArrivals } from "@/lib/data/products";

export default function HomePage() {
  const newArrivals = getNewArrivals();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Full-Bleed Carousel */}
      <HeroSlider />

      {/* 2. New Arrivals Carousel */}
      <NewArrivals products={newArrivals} />

      {/* 3. Shop By Category Tiles */}
      <CategoryTiles />

      {/* 4. Trending Now Tabbed Grid */}
      <TrendingSection products={products} />

      {/* 5. Highsnobiety / END. Editorial Storytelling */}
      <EditorialBlocks />

      {/* 6. Instagram Visual Strip */}
      <InstagramStrip />

      {/* 7. VIP Newsletter Banner */}
      <NewsletterBand />
    </div>
  );
}
