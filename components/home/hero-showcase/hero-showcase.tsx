"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Flame } from "lucide-react";
import { HeroSlideItem, HeroShowcaseProps, FALLBACK_HERO_SLIDES } from "./types";
import { useHeroShowcaseAnimation } from "./animations";

const DEFAULT_AUTOPLAY_MS = 6500;

export function HeroShowcase({
  initialSlides,
  autoplayIntervalMs = DEFAULT_AUTOPLAY_MS,
  isPreview = false,
  activePreviewIndex,
  onSlideChange,
  className = "",
}: HeroShowcaseProps) {
  const [slides, setSlides] = useState<HeroSlideItem[]>(
    initialSlides && initialSlides.length > 0 ? initialSlides : FALLBACK_HERO_SLIDES
  );
  const [currentIndex, setCurrentIndex] = useState(activePreviewIndex ?? 0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const shoeLayerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // If in admin preview mode, sync with activePreviewIndex prop
  useEffect(() => {
    if (isPreview && activePreviewIndex !== undefined) {
      setCurrentIndex(activePreviewIndex);
      setProgress(0);
    }
  }, [isPreview, activePreviewIndex]);

  // Fetch live active slides from public API if initialSlides not passed
  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) return;

    let isMounted = true;
    fetch("/api/hero-showcase")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.slides && data.slides.length > 0) {
          setSlides(data.slides);
        }
      })
      .catch(() => {
        // Safe fallback already seeded
      });

    return () => {
      isMounted = false;
    };
  }, [initialSlides]);

  // Hook for choreographed GSAP ScrollTrigger Entrance + Anime.js Slide Transitions
  const { reducedMotion, isMobile } = useHeroShowcaseAnimation({
    containerRef,
    textLayerRef,
    shoeLayerRef,
    currentIndex,
    direction,
    isPaused,
  });

  const totalSlides = slides.length;
  const safeIndex = totalSlides > 0 ? (currentIndex % totalSlides + totalSlides) % totalSlides : 0;
  const activeSlide = slides[safeIndex] || FALLBACK_HERO_SLIDES[0];

  // Manual slide change handler
  const goToSlide = useCallback(
    (targetIndex: number, newDirection: 1 | -1 = 1) => {
      if (totalSlides === 0) return;
      const normalized = (targetIndex % totalSlides + totalSlides) % totalSlides;
      setDirection(newDirection);
      setCurrentIndex(normalized);
      setProgress(0);
      startTimeRef.current = Date.now();
      if (onSlideChange) onSlideChange(normalized);
    },
    [totalSlides, onSlideChange]
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1, 1);
  }, [goToSlide, currentIndex]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1, -1);
  }, [goToSlide, currentIndex]);

  // Autoplay and Progress Bar Loop
  useEffect(() => {
    if (isPreview || isPaused || totalSlides <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      return;
    }

    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / autoplayIntervalMs) * 100);
      setProgress(pct);

      if (elapsed >= autoplayIntervalMs) {
        nextSlide();
      } else {
        progressAnimRef.current = requestAnimationFrame(updateProgress);
      }
    };

    progressAnimRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
    };
  }, [isPreview, isPaused, totalSlides, autoplayIntervalMs, currentIndex, nextSlide]);

  // Derived content fields with product fallback
  const headline =
    activeSlide.headlineOverride?.trim() ||
    activeSlide.product?.name ||
    "CALLY APEX RUNNER";

  const description =
    activeSlide.descriptionOverride?.trim() ||
    activeSlide.product?.description ||
    "Engineered for high-octane asphalt agility. High-contrast street architecture.";

  const primaryCtaText = activeSlide.ctaPrimaryLabel || "Shop Now";
  const primaryCtaLink =
    activeSlide.ctaPrimaryLink ||
    (activeSlide.product?.slug ? `/products/${activeSlide.product.slug}` : "/shop");

  const secondaryCtaText = activeSlide.ctaSecondaryLabel;
  const secondaryCtaLink = activeSlide.ctaSecondaryLink || "/shop";

  // Cutout image with fallback hierarchy
  const shoeImageSrc =
    activeSlide.cutoutImageUrl ||
    activeSlide.product?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80";

  return (
    <section
      ref={containerRef}
      onMouseEnter={() => !isMobile && setIsPaused(true)}
      onMouseLeave={() => !isMobile && setIsPaused(false)}
      onFocus={() => !isMobile && setIsPaused(true)}
      onBlur={() => !isMobile && setIsPaused(false)}
      aria-label="Hero Product Showcase"
      className={`relative w-full min-h-[640px] md:min-h-[720px] lg:min-h-[820px] bg-[#0E0D0B] text-white overflow-hidden select-none flex flex-col justify-between ${className}`}
      style={{ perspective: "1200px" }}
    >
      {/* =========================================================================
          LAYER 1: BACKGROUND (Dark base, subtle graphic radial glow, no stock photos)
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Subtle orange ambient spotlight radiating behind the shoe placement */}
        <div className="absolute right-[5%] top-[15%] w-[450px] md:w-[650px] lg:w-[800px] h-[450px] md:h-[650px] lg:h-[800px] rounded-full bg-[#E85D2C]/8 blur-[120px] md:blur-[160px]" />
        {/* Technical streetwear grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#FAF8F5 1px, transparent 1px), linear-gradient(to right, #FAF8F5 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        {/* Top/bottom dark vignettes for maximum contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B] via-transparent to-[#0E0D0B]/40" />
      </div>

      {/* =========================================================================
          MAIN STAGE: Dual-Layered Cinematic Depth (Text BEHIND, Shoe IN FRONT)
          ========================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 lg:pt-36 flex-1 flex flex-col justify-center">
        {/* Mobile: Vertical Stack (Shoe on top, Text below)
            Desktop: Overlapping Layered Architecture (Shoe in front of text) */}
        <div className="relative w-full flex flex-col md:block items-center">
          {/* =====================================================================
              LAYER 2: TEXT LAYER (Positioned BEHIND the shoe on desktop)
              ===================================================================== */}
          <div
            ref={textLayerRef}
            className="w-full md:max-w-2xl lg:max-w-3xl z-10 space-y-4 md:space-y-6 order-2 md:order-1 pt-6 md:pt-0"
          >
            {/* Eyebrow Streetwear Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#181714] border border-[#2D2A24] backdrop-blur-md shadow-sm">
              <Flame className="w-3.5 h-3.5 text-[#E85D2C] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-[#E85D2C]">
                {activeSlide.eyebrowLabel}
              </span>
            </div>

            {/* Massive Typography Headline (Rendered behind the shoe's front overlap zone) */}
            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-tighter text-white leading-[0.92] text-balance">
              {headline}
            </h1>

            {/* Concise Supporting Editorial Description */}
            <p className="text-xs sm:text-sm md:text-base text-[#C2BDB5] font-medium leading-relaxed max-w-xl">
              {description}
            </p>

            {/* CTA Button Pair */}
            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3">
              <Link
                href={primaryCtaLink}
                className="px-7 py-3.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#E85D2C]/20 hover:shadow-[#E85D2C]/35 hover:-translate-y-0.5 group active:translate-y-0"
              >
                <span>{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {secondaryCtaText && (
                <Link
                  href={secondaryCtaLink}
                  className="px-6 py-3.5 bg-white/5 hover:bg-white text-[#FAF8F5] hover:text-[#0E0D0B] font-display font-black text-xs sm:text-sm uppercase tracking-wider backdrop-blur-sm border border-white/15 hover:border-white transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{secondaryCtaText}</span>
                </Link>
              )}
            </div>
          </div>

          {/* =====================================================================
              LAYER 3: SHOE LAYER (Rendered LARGE, visually sits IN FRONT of text)
              ===================================================================== */}
          <div
            ref={shoeLayerRef}
            className="w-full md:absolute md:top-1/2 md:-translate-y-1/2 md:right-[-4%] lg:right-[-2%] md:w-[56%] lg:w-[62%] z-20 pointer-events-none order-1 md:order-2 flex justify-center md:justify-end"
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform, opacity",
            }}
          >
            <div className="relative w-[290px] sm:w-[420px] md:w-[560px] lg:w-[720px] xl:w-[780px] aspect-[4/3] flex items-center justify-center">
              {/* Soft Grounding Glow/Shadow beneath the shoe */}
              <div className="absolute bottom-[8%] left-[10%] right-[10%] h-[18%] bg-black/75 blur-2xl rounded-full transform rotate-[-3deg]" />

              {/* Cutout Shoe Graphic: overlaps text edge, transparent background */}
              <div className="relative w-full h-full">
                <Image
                  src={shoeImageSrc}
                  alt={headline}
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, (max-width: 1200px) 55vw, 780px"
                  className="object-contain object-center filter drop-shadow-[0_25px_30px_rgba(0,0,0,0.85)] select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          LAYER 4: FOREGROUND UI CONTROLS (Progress Bar & Prev/Next Arrows)
          ========================================================================= */}
      <div className="relative z-30 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 sm:pb-12 md:pb-14 pt-8">
        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          {/* Slide Indicator & Dynamic Progress Bar */}
          <div className="flex items-center gap-4 text-xs font-mono font-bold tracking-widest">
            <span className="text-[#E85D2C]">
              {String(safeIndex + 1).padStart(2, "0")}
            </span>
            <div className="w-28 sm:w-36 bg-white/15 h-1 relative overflow-hidden">
              <div
                className="bg-[#E85D2C] h-full transition-all ease-linear"
                style={{
                  width: `${progress}%`,
                  transitionDuration: isPaused ? "0ms" : "60ms",
                }}
              />
            </div>
            <span className="text-[#757068]">
              {String(Math.max(1, totalSlides)).padStart(2, "0")}
            </span>

            {/* Quick jump dots */}
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  onClick={() => goToSlide(idx, idx > safeIndex ? 1 : -1)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === safeIndex
                      ? "bg-[#E85D2C] scale-125"
                      : "bg-white/20 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Prev / Next Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Previous shoe slide"
              className="p-3 bg-white/5 hover:bg-white text-white hover:text-black border border-white/15 hover:border-white transition-colors active:scale-95 focus:outline-none focus:ring-1 focus:ring-[#E85D2C]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next shoe slide"
              className="p-3 bg-white/5 hover:bg-white text-white hover:text-black border border-white/15 hover:border-white transition-colors active:scale-95 focus:outline-none focus:ring-1 focus:ring-[#E85D2C]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
