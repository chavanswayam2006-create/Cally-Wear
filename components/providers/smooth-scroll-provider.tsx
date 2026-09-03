"use client";

import React, { useEffect, useRef } from "react";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let tickerUpdate: ((time: number) => void) | null = null;
    let gsapInstance: any = null;

    // Dynamically load animation libraries strictly in browser runtime
    Promise.all([
      import("lenis"),
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ])
      .then(([{ default: Lenis }, { default: gsap }, { ScrollTrigger }]) => {
        gsapInstance = gsap;
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.5,
        });

        lenisRef.current = lenis;

        // Synchronize Lenis scroll position with GSAP ScrollTrigger
        lenis.on("scroll", ScrollTrigger.update);

        tickerUpdate = (time: number) => {
          lenis.raf(time * 1000);
        };

        gsap.ticker.add(tickerUpdate);
        gsap.ticker.lagSmoothing(0);
      })
      .catch((err) => {
        console.warn("Smooth scroll initialization fallback:", err);
      });

    return () => {
      if (tickerUpdate && gsapInstance) {
        gsapInstance.ticker.remove(tickerUpdate);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  return <>{children}</>;
}
