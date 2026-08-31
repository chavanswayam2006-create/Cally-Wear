"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Zap, Layers } from "lucide-react";

export function EditorialBlocks() {
  return (
    <section className="bg-[#FAF8F5] border-b border-[#E4DFD5]">
      {/* Editorial Block 1: Concrete Tech */}
      <div className="border-b border-[#E4DFD5]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Image Side */}
          <div className="lg:col-span-7 relative min-h-[420px] lg:min-h-[580px] bg-[#12110E] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1400&q=80"
              alt="Engineered for the concrete"
              fill
              className="object-cover object-center"
            />
            <div className="absolute top-6 left-6 bg-[#12110E] text-white px-3 py-1 text-[11px] font-black uppercase tracking-widest border border-[#282622]">
              LAB REPORT // 004
            </div>
          </div>

          {/* Editorial Copy Side */}
          <div className="lg:col-span-5 p-8 sm:p-12 lg:p-16 flex flex-col justify-between bg-white border-l border-[#E4DFD5]">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block">
                PERFORMANCE ARCHITECTURE
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-[#12110E] leading-none">
                Engineered for the Asphalt
              </h3>
              <p className="text-xs sm:text-sm text-[#6B665F] leading-relaxed pt-2">
                We designed Cally Wear footwear to withstand relentless daily street rotation without compromising on runway-grade aesthetics. Every silhouette is tested against abrasive concrete and unpredictable weather.
              </p>

              <div className="space-y-3 pt-4 border-t border-[#E4DFD5]">
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-[#E85D2C] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-[#12110E] uppercase block font-display font-black">
                      Nitrogen-Injected Foam
                    </strong>
                    <span className="text-[#6B665F]">
                      Delivers up to 72% energy return with featherweight comfort.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#E85D2C] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-[#12110E] uppercase block font-display font-black">
                      Ballistic Ripstop & Leather
                    </strong>
                    <span className="text-[#6B665F]">
                      High-tensile uppers that resist scuffs and wear in gracefully.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/products/cally-apex-tech-runner"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors group"
              >
                <span>Discover Apex Tech Runner</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Block 2: The Monochrome Vault */}
      <div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Editorial Copy Side */}
          <div className="lg:col-span-5 order-2 lg:order-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-between bg-white border-r border-[#E4DFD5]">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block">
                DROP ARCHIVE // EXCLUSIVE
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-[#12110E] leading-none">
                The Monochrome Vault
              </h3>
              <p className="text-xs sm:text-sm text-[#6B665F] leading-relaxed pt-2">
                Stripped of gimmicks. Built in stark obsidian black, carbon charcoal, and warm bone white. Each pair is handcrafted in limited batches with individual serial debossing.
              </p>

              <div className="space-y-3 pt-4 border-t border-[#E4DFD5]">
                <div className="flex items-start gap-3">
                  <Layers className="w-4 h-4 text-[#E85D2C] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-[#12110E] uppercase block font-display font-black">
                      Full-Grain Italian Calfskin
                    </strong>
                    <span className="text-[#6B665F]">
                      Natural vegetable tanning that develops unique character over time.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/collections/monochrome-vault"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors group"
              >
                <span>Enter The Monochrome Vault</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Image Side */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative min-h-[420px] lg:min-h-[580px] bg-[#12110E] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=1400&q=80"
              alt="Monochrome Vault Editorial"
              fill
              className="object-cover object-center"
            />
            <div className="absolute bottom-6 right-6 bg-[#12110E] text-white px-3 py-1 text-[11px] font-black uppercase tracking-widest border border-[#282622]">
              MONOCHROME // DROP 04
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
