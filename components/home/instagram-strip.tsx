"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";

const igPosts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    likes: "1.4k",
    tag: "#ApexTechRunner",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
    likes: "980",
    tag: "#StrataPlatform",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80",
    likes: "2.1k",
    tag: "#StreetClassics",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=600&q=80",
    likes: "1.8k",
    tag: "#NomadTactical",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80",
    likes: "1.2k",
    tag: "#MonochromeVault",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80",
    likes: "3.4k",
    tag: "#AuraCourt",
  },
];

export function InstagramStrip() {
  return (
    <section className="py-16 md:py-24 bg-[#FAF8F5] border-b border-[#E4DFD5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#E4DFD5]">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
              COMMUNITY ROTATIONS
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-[#12110E]">
              As Seen In The Streets
            </h2>
          </div>

          <a
            href="https://www.instagram.com/cally_wear"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#12110E] hover:bg-[#E85D2C] text-white text-xs font-black uppercase tracking-wider transition-colors"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Follow @cally_wear</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 6-Grid Square Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-8">
          {igPosts.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/cally_wear"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square bg-[#12110E] overflow-hidden border border-[#E4DFD5] hover:border-black transition-colors"
            >
              <Image
                src={post.image}
                alt={`Cally Wear on Instagram ${post.tag}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center text-white">
                <InstagramIcon className="w-6 h-6 text-[#E85D2C] mb-1.5" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FAF8F5]">
                  {post.tag}
                </span>
                <span className="text-[9px] text-[#99948D] mt-1 font-mono">
                  ♥ {post.likes}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
