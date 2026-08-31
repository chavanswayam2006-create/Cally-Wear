"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame } from "lucide-react";

interface MegaNavProps {
  activeMenu: string | null;
  setActiveMenu: (menu: string | null) => void;
}

export function MegaNav({ activeMenu, setActiveMenu }: MegaNavProps) {
  if (!activeMenu) return null;

  return (
    <div
      onMouseEnter={() => setActiveMenu(activeMenu)}
      onMouseLeave={() => setActiveMenu(null)}
      className="absolute top-full left-0 w-full bg-[#FAF8F5] border-b border-[#E4DFD5] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeMenu === "men" && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-3">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#12110E] pb-3 border-b border-[#E4DFD5]">
                By Category
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-[#4A4742]">
                <li>
                  <Link
                    href="/shop/men"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors flex items-center justify-between"
                  >
                    <span>All Men&apos;s Footwear</span>
                    <span className="text-xs text-[#8C877E] font-normal">10 styles</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop/men?category=running"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Performance & Running
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop/men?category=streetwear"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Streetwear & High-Tops
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop/men?category=sneakers"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Retro & Court Lows
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop/men?category=basketball"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Basketball & Mid-Tops
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop/men?category=slides"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Slides & Recovery Mules
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-3">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#12110E] pb-3 border-b border-[#E4DFD5]">
                Trending & Drops
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-[#4A4742]">
                <li>
                  <Link
                    href="/products/cally-apex-tech-runner"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors flex items-center gap-2 text-[#E85D2C] font-bold"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Apex Tech Runner (Drop 04)</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/cally-zenith-carbon-racer"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Zenith Carbon Racer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/cally-nomad-tactical-high"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Nomad Tactical High
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/cally-monolith-lux-leather"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Monolith Italian Calfskin
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/cally-eclipse-stealth-black"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Eclipse Triple Black
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-6 grid grid-cols-2 gap-4">
              <Link
                href="/products/cally-apex-tech-runner"
                onClick={() => setActiveMenu(null)}
                className="group relative overflow-hidden bg-[#12110E] text-white p-4 flex flex-col justify-end aspect-[4/3] border border-[#282622]"
              >
                <Image
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
                  alt="Apex Tech Runner"
                  fill
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="relative z-10">
                  <span className="text-[10px] tracking-widest font-black uppercase text-[#E85D2C] bg-[#12110E]/80 px-2 py-0.5 inline-block mb-1">
                    NEW RELEASE
                  </span>
                  <h4 className="font-display font-black text-lg leading-tight uppercase text-white">
                    Apex Tech Runner
                  </h4>
                  <p className="text-xs text-white/80 mt-1 flex items-center gap-1 font-medium">
                    Explore Drop <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </Link>

              <Link
                href="/collections/monochrome-vault"
                onClick={() => setActiveMenu(null)}
                className="group relative overflow-hidden bg-[#12110E] text-white p-4 flex flex-col justify-end aspect-[4/3] border border-[#282622]"
              >
                <Image
                  src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80"
                  alt="Monochrome Vault"
                  fill
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="relative z-10">
                  <span className="text-[10px] tracking-widest font-black uppercase text-[#E85D2C] bg-[#12110E]/80 px-2 py-0.5 inline-block mb-1">
                    FEATURED VAULT
                  </span>
                  <h4 className="font-display font-black text-lg leading-tight uppercase text-white">
                    Monochrome Edition
                  </h4>
                  <p className="text-xs text-white/80 mt-1 flex items-center gap-1 font-medium">
                    View Lookbook <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {activeMenu === "women" && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-3">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#12110E] pb-3 border-b border-[#E4DFD5]">
                By Category
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-[#4A4742]">
                <li>
                  <Link
                    href="/shop/women"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors flex items-center justify-between"
                  >
                    <span>All Women&apos;s Footwear</span>
                    <span className="text-xs text-[#8C877E] font-normal">8 styles</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop/women?category=streetwear"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Platform & Chunky Soles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop/women?category=sneakers"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Minimalist Clean Court
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop/women?category=running"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Lightweight Trainers & Knit
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop/women?category=slides"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Cloud Slides & Mules
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-3">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#12110E] pb-3 border-b border-[#E4DFD5]">
                Featured Silhouettes
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-[#4A4742]">
                <li>
                  <Link
                    href="/products/cally-strata-chunky-platform"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors flex items-center gap-2 text-[#E85D2C] font-bold"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Strata Chunky Platform</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/cally-aura-minimalist-court"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Aura Minimalist Court
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/cally-vortex-knit-trainer"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Vortex Knit Trainer (Dusty Rose)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/cally-nova-pastel-court"
                    onClick={() => setActiveMenu(null)}
                    className="hover:text-[#E85D2C] transition-colors"
                  >
                    Nova Pastel Court
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-6 grid grid-cols-2 gap-4">
              <Link
                href="/products/cally-strata-chunky-platform"
                onClick={() => setActiveMenu(null)}
                className="group relative overflow-hidden bg-[#12110E] text-white p-4 flex flex-col justify-end aspect-[4/3] border border-[#282622]"
              >
                <Image
                  src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80"
                  alt="Strata Chunky Platform"
                  fill
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="relative z-10">
                  <span className="text-[10px] tracking-widest font-black uppercase text-[#E85D2C] bg-[#12110E]/80 px-2 py-0.5 inline-block mb-1">
                    TOP SELLER
                  </span>
                  <h4 className="font-display font-black text-lg leading-tight uppercase text-white">
                    Strata Platform
                  </h4>
                  <p className="text-xs text-white/80 mt-1 flex items-center gap-1 font-medium">
                    Shop Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </Link>

              <Link
                href="/collections/summer-slides-mules"
                onClick={() => setActiveMenu(null)}
                className="group relative overflow-hidden bg-[#12110E] text-white p-4 flex flex-col justify-end aspect-[4/3] border border-[#282622]"
              >
                <Image
                  src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80"
                  alt="Cloud Slides"
                  fill
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="relative z-10">
                  <span className="text-[10px] tracking-widest font-black uppercase text-[#E85D2C] bg-[#12110E]/80 px-2 py-0.5 inline-block mb-1">
                    SUMMER EDIT
                  </span>
                  <h4 className="font-display font-black text-lg leading-tight uppercase text-white">
                    Recovery Slides
                  </h4>
                  <p className="text-xs text-white/80 mt-1 flex items-center gap-1 font-medium">
                    Explore Slides <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {activeMenu === "collections" && (
          <div className="grid grid-cols-4 gap-6">
            <Link
              href="/collections/monochrome-vault"
              onClick={() => setActiveMenu(null)}
              className="group block border border-[#E4DFD5] bg-white hover:border-[#12110E] transition-all p-3"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black mb-3">
                <Image
                  src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=500&q=80"
                  alt="Monochrome Vault"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E85D2C]">
                DROP 04
              </span>
              <h4 className="font-display font-black text-base uppercase text-[#12110E] mt-0.5">
                Monochrome Vault
              </h4>
              <p className="text-xs text-[#6B665F] line-clamp-2 mt-1">
                Shadow and light in pure contrast silhouettes.
              </p>
            </Link>

            <Link
              href="/collections/street-classics"
              onClick={() => setActiveMenu(null)}
              className="group block border border-[#E4DFD5] bg-white hover:border-[#12110E] transition-all p-3"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black mb-3">
                <Image
                  src="https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=500&q=80"
                  alt="Street Classics"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E85D2C]">
                ESSENTIALS
              </span>
              <h4 className="font-display font-black text-base uppercase text-[#12110E] mt-0.5">
                Street Classics
              </h4>
              <p className="text-xs text-[#6B665F] line-clamp-2 mt-1">
                Heritage silhouettes engineered for everyday pavement rotation.
              </p>
            </Link>

            <Link
              href="/collections/performance-lab"
              onClick={() => setActiveMenu(null)}
              className="group block border border-[#E4DFD5] bg-white hover:border-[#12110E] transition-all p-3"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black mb-3">
                <Image
                  src="https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=500&q=80"
                  alt="Performance Lab"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E85D2C]">
                CARBON & SPEED
              </span>
              <h4 className="font-display font-black text-base uppercase text-[#12110E] mt-0.5">
                Performance Lab
              </h4>
              <p className="text-xs text-[#6B665F] line-clamp-2 mt-1">
                Nitrogen superfoams and propulsion carbon-plate racers.
              </p>
            </Link>

            <Link
              href="/collections/summer-slides-mules"
              onClick={() => setActiveMenu(null)}
              className="group block border border-[#E4DFD5] bg-white hover:border-[#12110E] transition-all p-3"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black mb-3">
                <Image
                  src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=80"
                  alt="Recovery Slides"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E85D2C]">
                OFF-DUTY
              </span>
              <h4 className="font-display font-black text-base uppercase text-[#12110E] mt-0.5">
                Recovery Slides & Mules
              </h4>
              <p className="text-xs text-[#6B665F] line-clamp-2 mt-1">
                Cloud foam cushioning and tactical waterproof comfort.
              </p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
