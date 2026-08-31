"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Street & Court Retro",
    tag: "STREETWEAR ICONS",
    link: "/shop?category=sneakers",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
    itemCount: "6 Silhouettes",
  },
  {
    title: "Performance & Run",
    tag: "CARBON PROPULSION",
    link: "/shop?category=running",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    itemCount: "5 Silhouettes",
  },
  {
    title: "Platform & Chunky",
    tag: "WOMEN'S ELEVATION",
    link: "/shop/women?category=streetwear",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80",
    itemCount: "4 Silhouettes",
  },
  {
    title: "Cloud Slides & Mules",
    tag: "RECOVERY FOAM",
    link: "/shop?category=slides",
    image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=900&q=80",
    itemCount: "3 Silhouettes",
  },
];

export function CategoryTiles() {
  return (
    <section className="py-16 md:py-24 bg-[#12110E] text-white border-b border-[#282622]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#282622]">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
              CURATED ROTATIONS
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-white">
              Shop by Category
            </h2>
          </div>
          <p className="text-xs text-[#99948D] max-w-xs font-medium">
            Form follows function. Precision-built footwear tuned for asphalt, hardwood, and recovery.
          </p>
        </div>

        {/* 4 Tile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-8">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.link}
              className="group relative aspect-[3/4] bg-[#181714] border border-[#282622] overflow-hidden flex flex-col justify-end p-6 hover:border-[#E85D2C] transition-colors"
            >
              {/* Background Image */}
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center opacity-65 group-hover:scale-105 transition-transform duration-700"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#12110E] via-[#12110E]/40 to-transparent" />

              {/* Text Content */}
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#E85D2C] block">
                  {cat.tag}
                </span>
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-white group-hover:text-[#E85D2C] transition-colors">
                  {cat.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-[#99948D] pt-2 border-t border-white/10 mt-2">
                  <span>{cat.itemCount}</span>
                  <span className="text-white font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
