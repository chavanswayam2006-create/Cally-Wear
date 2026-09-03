"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Layers,
  Cpu,
  Flame,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface ShowcaseChapter {
  id: string;
  productId: string;
  displayOrder: number;
  isActive: boolean;
  overrideImageUrl?: string | null;
  highlightLabel: string;
  highlightDescription: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    salePrice?: number | null;
    isOnSale?: boolean;
    materials?: string;
    description?: string;
    images?: Array<{ url: string; altText?: string | null }>;
  } | null;
}

const FALLBACK_SHOWCASE_ITEMS: ShowcaseChapter[] = [
  {
    id: "showcase_01",
    productId: "prod_01",
    displayOrder: 0,
    isActive: true,
    highlightLabel: "TACTICAL BALLISTIC CAGE",
    highlightDescription:
      "Constructed with ripstop ballistic nylon and molded TPU sidewall reinforcements for maximum lateral containment during intense street maneuvers.",
    product: {
      id: "prod_01",
      name: "Apex Tech Runner",
      slug: "apex-tech-runner",
      basePrice: 7999,
      salePrice: 6999,
      isOnSale: true,
      materials:
        "Ripstop ballistic nylon, TPU cage, Nitrogen-infused EVA foam midsole, Vibram rubber tread outsole",
      images: [
        {
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
          altText: "Apex Tech Runner Profile",
        },
      ],
    },
  },
  {
    id: "showcase_02",
    productId: "prod_01",
    displayOrder: 1,
    isActive: true,
    highlightLabel: "NITROGEN-INJECTED FOAM",
    highlightDescription:
      "Supercritical cellular nitrogen foam core delivers explosive 78% energy rebound while attenuating harsh ground impact over relentless concrete.",
    product: {
      id: "prod_01",
      name: "Apex Tech Runner",
      slug: "apex-tech-runner",
      basePrice: 7999,
      salePrice: 6999,
      isOnSale: true,
      materials:
        "Ripstop ballistic nylon, TPU cage, Nitrogen-infused EVA foam midsole, Vibram rubber tread outsole",
      images: [
        {
          url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
          altText: "Apex Tech Runner Sole",
        },
      ],
    },
  },
  {
    id: "showcase_03",
    productId: "prod_01",
    displayOrder: 2,
    isActive: true,
    highlightLabel: "VIBRAM COMMANDO GRIP",
    highlightDescription:
      "Multi-directional chevron siping and high-abrasion Megagrip compound engineered for uncompromised wet-surface traction and instantaneous stopping power.",
    product: {
      id: "prod_01",
      name: "Apex Tech Runner",
      slug: "apex-tech-runner",
      basePrice: 7999,
      salePrice: 6999,
      isOnSale: true,
      materials:
        "Ripstop ballistic nylon, TPU cage, Nitrogen-infused EVA foam midsole, Vibram rubber tread outsole",
      images: [
        {
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
          altText: "Apex Tech Runner Grip",
        },
      ],
    },
  },
];

export function ScrollShowcase() {
  const [items, setItems] = useState<ShowcaseChapter[]>(FALLBACK_SHOWCASE_ITEMS);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const shoeLayerRef = useRef<HTMLDivElement>(null);
  const shoeImageRef = useRef<HTMLDivElement>(null);
  const chaptersContainerRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLAnchorElement>(null);

  // Fetch real data from public API
  useEffect(() => {
    let isMounted = true;
    fetch("/api/scroll-showcase")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load showcase");
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.items && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch(() => {
        // graceful fallback to initial seed items
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // GSAP ScrollTrigger Pinned Timeline
  useEffect(() => {
    if (reducedMotion || !containerRef.current || !stageRef.current || items.length === 0) {
      return;
    }

    const container = containerRef.current;
    const stage = stageRef.current;
    const shoe = shoeImageRef.current;
    let tl: any = null;
    let scrollTriggerInstance: any = null;

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);

      const chapterEls = gsap.utils.toArray<HTMLElement>(".showcase-chapter");
      if (!shoe || chapterEls.length === 0) return;

      // Reset initial states
      gsap.set(shoe, {
        transformPerspective: 1200,
        rotateY: -8,
        rotateX: 6,
        scale: 1,
        transformOrigin: "center center",
        willChange: "transform",
      });

      chapterEls.forEach((el, index) => {
        if (index === 0) {
          gsap.set(el, { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" });
        } else {
          gsap.set(el, { opacity: 0, y: 60, scale: 0.94, pointerEvents: "none" });
        }
      });

      // Create Pinning Timeline
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          pin: stage,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            const chapterCount = items.length;
            const currentIndex = Math.min(
              Math.floor(progress * chapterCount),
              chapterCount - 1
            );
            setActiveChapterIndex(currentIndex);
          },
          onLeave: () => {
            if (shoe) shoe.style.willChange = "auto";
          },
          onEnterBack: () => {
            if (shoe) shoe.style.willChange = "transform";
          },
        },
      });

      scrollTriggerInstance = tl.scrollTrigger;

      // Animate chapters sequentially
      const totalChapters = chapterEls.length;
      const stepDuration = 1 / totalChapters;

      // Shoe 3D tilt progression throughout the scroll runway
      tl.to(shoe, {
        rotateY: 8,
        rotateX: -6,
        scale: 1.06,
        ease: "power1.inOut",
        duration: 1,
      }, 0);

      // Transitions between chapters
      for (let i = 0; i < totalChapters - 1; i++) {
        const currentChapter = chapterEls[i];
        const nextChapter = chapterEls[i + 1];
        const transitionTime = (i + 1) * stepDuration - stepDuration * 0.2;

        // Outgoing chapter: recedes and fades
        tl.to(
          currentChapter,
          {
            opacity: 0,
            y: -40,
            scale: 0.96,
            ease: "power2.in",
            duration: stepDuration * 0.4,
            pointerEvents: "none",
          },
          transitionTime
        );

        // Incoming chapter: emerges from behind shoe with clip-path expansion
        tl.fromTo(
          nextChapter,
          {
            opacity: 0,
            y: 50,
            scale: 0.92,
            pointerEvents: "none",
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "power2.out",
            duration: stepDuration * 0.4,
            pointerEvents: "auto",
          },
          transitionTime + stepDuration * 0.2
        );
      }
    }).catch((err) => {
      console.warn("GSAP timeline initialization fallback:", err);
    });

    return () => {
      if (tl) tl.kill();
      if (scrollTriggerInstance) scrollTriggerInstance.kill();
    };
  }, [items, reducedMotion]);

  // anime.js Polish: Headline letter/word reveal on active chapter change
  useEffect(() => {
    if (reducedMotion) return;

    import("animejs").then((mod) => {
      const anime = (mod as any).default || mod;

      const currentTitleEl = document.querySelector(
        `.chapter-${activeChapterIndex} .reveal-title`
      );
      if (currentTitleEl) {
        anime({
          targets: currentTitleEl,
          opacity: [0, 1],
          translateY: [15, 0],
          easing: "easeOutExpo",
          duration: 800,
        });
      }

      const currentBadgeEl = document.querySelector(
        `.chapter-${activeChapterIndex} .reveal-badge`
      );
      if (currentBadgeEl) {
        anime({
          targets: currentBadgeEl,
          opacity: [0, 1],
          scale: [0.92, 1],
          easing: "easeOutBack",
          duration: 600,
        });
      }
    }).catch(() => {});
  }, [activeChapterIndex, reducedMotion]);

  // anime.js CTA Button Magnetic Hover Micro-Interaction
  const handleCtaHover = (enter: boolean) => {
    if (!ctaButtonRef.current || reducedMotion) return;
    import("animejs").then((mod) => {
      const anime = (mod as any).default || mod;
      anime({
        targets: ctaButtonRef.current,
        scale: enter ? 1.03 : 1,
        boxShadow: enter
          ? "0 10px 25px -5px rgba(232, 93, 44, 0.4)"
          : "0 0px 0px 0px rgba(232, 93, 44, 0)",
        duration: 350,
        easing: "easeOutQuad",
      });
    }).catch(() => {});
  };

  // Resolve active hero product & image
  const primaryProduct = items[0]?.product;
  const heroImageSrc =
    items[activeChapterIndex]?.overrideImageUrl ||
    items[0]?.overrideImageUrl ||
    primaryProduct?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80";

  // Reduced motion alternative layout
  if (reducedMotion) {
    return (
      <section className="bg-[#100F0D] text-white py-20 px-4 md:px-8 border-y border-[#26241F]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-[#E85D2C] uppercase tracking-widest">
              Signature Lab Showcase
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight">
              {primaryProduct?.name || "Apex Performance Footwear"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((chapter, idx) => (
              <div
                key={chapter.id || idx}
                className="bg-[#181714] border border-[#282622] p-6 space-y-4"
              >
                <div className="text-xs font-mono text-[#E85D2C] uppercase tracking-wider">
                  Chapter 0{idx + 1} // {chapter.highlightLabel}
                </div>
                <h3 className="font-display font-bold text-xl uppercase">
                  {chapter.product?.name || "Cally Elite"}
                </h3>
                <p className="text-xs text-[#99948D] leading-relaxed">
                  {chapter.highlightDescription}
                </p>
                {idx === items.length - 1 && chapter.product && (
                  <Link
                    href={`/products/${chapter.product.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D2C] uppercase tracking-wider hover:underline pt-2"
                  >
                    <span>Shop Silhouette</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative bg-[#0E0D0B] text-white overflow-hidden select-none"
      style={{
        // 350vh runway provides ample scrub distance across chapters
        height: `${Math.max(items.length, 3) * 110}vh`,
      }}
      aria-label="Signature Scroll Showcase"
    >
      {/* Pinned Stage Container */}
      <div
        ref={stageRef}
        className="w-full h-screen flex flex-col justify-between relative overflow-hidden bg-radial from-[#1A1814] via-[#0E0D0B] to-[#080807]"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Cinematic Ambient Backdrop Lighting */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E85D2C]/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px]" />
          {/* Subtle Technical Grid Lines */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #FAF8F5 1px, transparent 1px), linear-gradient(to bottom, #FAF8F5 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Top Header / Chapter Meta Indicator */}
        <div className="relative z-30 pt-8 px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1C1A17] border border-[#2B2823] text-[#E85D2C] text-[10px] font-mono font-bold tracking-widest uppercase">
              <Flame className="w-3 h-3 fill-current" />
              <span>LAB SERIES</span>
            </span>
            <span className="text-[11px] font-mono text-[#8C877E] uppercase tracking-widest hidden sm:inline">
              ANATOMICAL SPECIFICATION MATRIX
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#E85D2C] font-bold">
              0{activeChapterIndex + 1}
            </span>
            <span className="text-[#4A463F]">/</span>
            <span className="text-[#8C877E]">0{items.length}</span>
          </div>
        </div>

        {/* Center Stage: Pinned 3D Shoe + Emerging Masked Chapters */}
        <div className="relative flex-1 w-full max-w-7xl mx-auto flex items-center justify-center px-4 md:px-8">
          {/* Chapters Layer (Layered behind the shoe via z-10) */}
          <div
            ref={chaptersContainerRef}
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          >
            {items.map((chapter, idx) => {
              const prod = chapter.product || primaryProduct;
              const isFinalChapter = idx === items.length - 1;
              const displayPrice = prod?.isOnSale && prod.salePrice ? prod.salePrice : prod?.basePrice || 7999;
              const compareAtPrice = prod?.isOnSale ? prod?.basePrice : undefined;

              return (
                <div
                  key={chapter.id || idx}
                  className={`showcase-chapter chapter-${idx} absolute w-full max-w-4xl px-4 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 transition-none`}
                  style={{
                    // Masked emergence: text appears to emerge dynamically from the shoe's footprint
                    clipPath: "inset(0% 0% 0% 0%)",
                  }}
                >
                  {/* Left Column: Spec Label & Oversized Headline */}
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="reveal-badge inline-flex items-center gap-2 px-3 py-1 bg-[#181714]/80 border border-[#2B2823] backdrop-blur-md">
                      <Cpu className="w-3 h-3 text-[#E85D2C]" />
                      <span className="text-[11px] font-mono font-bold tracking-widest text-[#E85D2C] uppercase">
                        {chapter.highlightLabel}
                      </span>
                    </div>

                    <h3 className="reveal-title font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-white leading-none">
                      {prod?.name || "Apex Tech Runner"}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#A39E95] max-w-md leading-relaxed mx-auto md:mx-0 font-sans">
                      {chapter.highlightDescription}
                    </p>
                  </div>

                  {/* Right Column: Spec Metrics or Direct Purchase CTA */}
                  <div className="w-full md:w-80 flex flex-col items-center md:items-end justify-center space-y-4 text-center md:text-right">
                    {isFinalChapter && prod ? (
                      <div className="space-y-4 w-full flex flex-col items-center md:items-end">
                        {/* Price & Badge */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C877E] block">
                            Direct Street Launch
                          </span>
                          <div className="flex items-baseline gap-2.5 justify-center md:justify-end">
                            <span className="font-display font-black text-2xl sm:text-3xl text-white">
                              ₹{displayPrice.toLocaleString("en-IN")}
                            </span>
                            {compareAtPrice && (
                              <span className="text-xs text-[#6B665F] line-through font-mono">
                                ₹{compareAtPrice.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Link
                          ref={ctaButtonRef}
                          href={`/products/${prod.slug}`}
                          onMouseEnter={() => handleCtaHover(true)}
                          onMouseLeave={() => handleCtaHover(false)}
                          className="w-full sm:w-auto px-8 py-4 bg-[#E85D2C] hover:bg-[#D44E1F] text-white font-display font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 pointer-events-auto shadow-lg"
                        >
                          <span>Shop {prod.name}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-[#141310]/80 border border-[#24221D] p-4 backdrop-blur-md w-full max-w-xs text-left">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#8C877E] uppercase tracking-wider">
                          <Layers className="w-3 h-3 text-[#E85D2C]" />
                          <span>Material Matrix</span>
                        </div>
                        <p className="text-[11px] text-[#C5C0B8] leading-snug line-clamp-3">
                          {prod?.materials || "Technical ballistic mesh with responsive nitrogen composite cushioning."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hero Shoe Layer (Pinned Center Stage, z-20) */}
          <div
            ref={shoeLayerRef}
            className="relative z-20 w-full max-w-2xl h-[340px] sm:h-[420px] md:h-[500px] flex items-center justify-center pointer-events-none"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <div
              ref={shoeImageRef}
              className="relative w-full h-full flex items-center justify-center drop-shadow-[0_35px_45px_rgba(0,0,0,0.85)]"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              <Image
                src={heroImageSrc}
                alt={primaryProduct?.name || "Cally Wear Hero Silhouette"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-contain filter contrast-[1.05] brightness-[1.02]"
              />

              {/* Dynamic Ground Shadow */}
              <div className="absolute -bottom-6 w-3/4 h-12 bg-black/60 blur-2xl rounded-full -z-10" />
            </div>
          </div>
        </div>

        {/* Bottom Section: Scrubber Progress & Chapter Switcher */}
        <div className="relative z-30 pb-8 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1C1A17]">
          {/* Scroll Cue */}
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E85D2C] animate-ping" />
            <span className="text-[10px] font-mono text-[#8C877E] uppercase tracking-widest">
              Scroll To Deconstruct Anatomy
            </span>
          </div>

          {/* Segmented Timeline Progress Bar */}
          <div className="flex items-center gap-1.5 w-full sm:w-64">
            {items.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 bg-[#24221D] overflow-hidden rounded-full"
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    idx <= activeChapterIndex ? "bg-[#E85D2C] w-full" : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Quick Specs Callout */}
          <div className="text-[10px] font-mono text-[#8C877E] tracking-wider uppercase hidden md:flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-[#E85D2C]" />
            <span>{items[activeChapterIndex]?.highlightLabel || "SPECIFICATION LOADED"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
