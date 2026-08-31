"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Flame } from "lucide-react";

const heroSlides = [
  {
    id: 1,
    tag: "DROP 04 / EXCLUSIVE LAUNCH",
    headline: "CALLY APEX TECH RUNNER",
    subheading: "Engineered for high-octane asphalt agility. Responsive nitrogen-injected cushioning meets tactical ripstop architecture.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1920&q=85",
    primaryCta: { text: "EXPLORE THE DROP", link: "/products/cally-apex-tech-runner" },
    secondaryCta: { text: "SHOP MEN'S KICKS", link: "/shop/men" },
    accent: "#E85D2C",
  },
  {
    id: 2,
    tag: "LIMITED EDITORIAL COLLECTION",
    headline: "THE MONOCHROME VAULT",
    subheading: "Stripped of color distractions. Shadow and light engineered with heavy tumbled Italian leathers and obsidian carbon accents.",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1920&q=85",
    primaryCta: { text: "VIEW VAULT LOOKBOOK", link: "/collections/monochrome-vault" },
    secondaryCta: { text: "ALL SNEAKERS", link: "/shop" },
    accent: "#FAF8F5",
  },
  {
    id: 3,
    tag: "WOMEN'S STREETWEAR ICON",
    headline: "STRATA CHUNKY PLATFORM",
    subheading: "52mm sculpted elevation. Featherlight composite geometry crafted to elevate your daily street stance with zero fatigue.",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1920&q=85",
    primaryCta: { text: "SHOP STRATA", link: "/products/cally-strata-chunky-platform" },
    secondaryCta: { text: "WOMEN'S COLLECTION", link: "/shop/women" },
    accent: "#E85D2C",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % heroSlides.length);
  };

  const activeSlide = heroSlides[current];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[82vh] min-h-[580px] max-h-[850px] bg-[#12110E] text-white overflow-hidden select-none"
    >
      {/* Background Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image */}
          <Image
            src={slide.image}
            alt={slide.headline}
            fill
            priority={index === 0}
            className={`object-cover object-center transition-transform duration-10000 ease-linear ${
              index === current ? "scale-105" : "scale-100"
            }`}
          />
          {/* Vignette and Dark Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12110E] via-[#12110E]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#12110E] via-[#12110E]/40 to-transparent" />
        </div>
      ))}

      {/* Hero Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 md:pb-20">
        <div className="max-w-2xl space-y-4">
          {/* Drop Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#12110E]/80 border border-[#282622] backdrop-blur-sm">
            <Flame className="w-3.5 h-3.5 text-[#E85D2C]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#E85D2C]">
              {activeSlide.tag}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tighter text-white leading-none text-balance">
            {activeSlide.headline}
          </h1>

          {/* Subheading */}
          <p className="text-xs sm:text-sm md:text-base text-[#D4CFC7] font-medium leading-relaxed max-w-xl">
            {activeSlide.subheading}
          </p>

          {/* Action CTAs */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              href={activeSlide.primaryCta.link}
              className="px-6 py-3.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg group"
            >
              <span>{activeSlide.primaryCta.text}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href={activeSlide.secondaryCta.link}
              className="px-6 py-3.5 bg-white/10 hover:bg-white text-white hover:text-[#12110E] font-display font-black text-xs sm:text-sm uppercase tracking-wider backdrop-blur-sm border border-white/20 transition-all"
            >
              <span>{activeSlide.secondaryCta.text}</span>
            </Link>
          </div>
        </div>

        {/* Bottom Carousel Controls */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
          {/* Slide Counters */}
          <div className="flex items-center gap-4 text-xs font-mono font-bold tracking-widest">
            <span className="text-[#E85D2C]">0{current + 1}</span>
            <div className="w-24 bg-white/20 h-1 relative overflow-hidden">
              <div
                className="bg-[#E85D2C] h-full transition-all duration-300"
                style={{ width: `${((current + 1) / heroSlides.length) * 100}%` }}
              />
            </div>
            <span className="text-[#8C877E]">0{heroSlides.length}</span>
          </div>

          {/* Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="p-2.5 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="p-2.5 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
