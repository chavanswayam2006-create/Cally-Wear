"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseHeroAnimationOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  textLayerRef: React.RefObject<HTMLDivElement | null>;
  shoeLayerRef: React.RefObject<HTMLDivElement | null>;
  currentIndex: number;
  direction?: 1 | -1;
  isPaused?: boolean;
}

/**
 * 3D DEPTH ARCHITECTURAL ASSUMPTION:
 * Cally Wear's product photography consists of high-resolution cutout PNG assets
 * rather than heavy Three.js / WebGL 3D meshes. We achieve a cinematic, tactile 3D feel
 * through CSS 3D perspective (perspective: 1200px) combined with choreographed
 * transform3d (rotateY, rotateX, rotateZ, translateZ) driven by GSAP and Anime.js.
 * 
 * Clean Extension Point: If true 3D/glTF shoe assets are integrated in the future,
 * the shoe layer container can seamlessly host a Three.js Canvas component with orbit/lighting
 * without altering the text layering or ScrollTrigger timeline coordination.
 */
export function useHeroShowcaseAnimation({
  containerRef,
  textLayerRef,
  shoeLayerRef,
  currentIndex,
  direction = 1,
}: UseHeroAnimationOptions) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isEntranceDoneRef = useRef(false);
  const prevIndexRef = useRef(currentIndex);

  // 1. Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // 2. Detect Mobile View (<768px)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 3. Viewport Entrance Animation via GSAP ScrollTrigger
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let ctx: any = null;
    let scrollTriggerInstance: any = null;

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const textLayer = textLayerRef.current;
        const shoeLayer = shoeLayerRef.current;
        const container = containerRef.current;

        if (!container || !textLayer || !shoeLayer) return;

        if (reducedMotion) {
          // Pure fade for reduced motion
          gsap.fromTo(
            [textLayer, shoeLayer],
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: container,
                start: "top 80%",
                once: true,
              },
              onComplete: () => {
                isEntranceDoneRef.current = true;
              },
            }
          );
          return;
        }

        if (isMobile) {
          // Clean slide-up on mobile, no heavy 3D tilt
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: container,
              start: "top 85%",
              once: true,
            },
            onComplete: () => {
              isEntranceDoneRef.current = true;
            },
          });

          tl.fromTo(
            shoeLayer,
            { opacity: 0, y: 30, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power2.out" }
          ).fromTo(
            textLayer,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.4"
          );
          return;
        }

        // Desktop Choreographed Reveal:
        // Text layer animates FIRST (starts earlier, moves less)
        // Shoe layer animates ON TOP (starts ~180ms later, moves more with 3D scale/rotation)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            once: true,
          },
          onComplete: () => {
            isEntranceDoneRef.current = true;
          },
        });

        // Set initial resting pose
        gsap.set(textLayer, { opacity: 0, y: 35 });
        gsap.set(shoeLayer, {
          opacity: 0,
          scale: 0.78,
          rotationZ: -14,
          rotationY: 18,
          rotationX: 8,
          z: 0,
          transformOrigin: "center center",
        });

        // Text layer entrance (starts t=0)
        tl.to(textLayer, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
        });

        // Shoe layer entrance (starts +180ms later, arrives IN FRONT OF the text)
        tl.to(
          shoeLayer,
          {
            opacity: 1,
            scale: 1,
            rotationZ: -4,
            rotationY: 7,
            rotationX: 2,
            z: 40,
            duration: 1.1,
            ease: "power2.out",
          },
          0.18
        );
      }, containerRef);
    });

    return () => {
      if (ctx) ctx.revert();
      if (scrollTriggerInstance) scrollTriggerInstance.kill();
    };
  }, [reducedMotion, isMobile, containerRef, textLayerRef, shoeLayerRef]);

  // 4. Per-Slide Transition Choreography via Anime.js
  useEffect(() => {
    // Skip if this is the initial mount and entrance is taking care of it
    if (prevIndexRef.current === currentIndex && !isEntranceDoneRef.current) {
      return;
    }

    prevIndexRef.current = currentIndex;

    const textLayer = textLayerRef.current;
    const shoeLayer = shoeLayerRef.current;

    if (!textLayer || !shoeLayer) return;

    if (reducedMotion) {
      // Reduced motion: gentle cross-fade only
      import("animejs").then((mod) => {
        const anime = (mod as any).default || mod;
        anime({
          targets: [textLayer, shoeLayer],
          opacity: [0, 1],
          duration: 400,
          easing: "linear",
        });
      });
      return;
    }

    if (isMobile) {
      // Mobile: lightweight fade + subtle slide
      import("animejs").then((mod) => {
        const anime = (mod as any).default || mod;
        anime({
          targets: shoeLayer,
          opacity: [0, 1],
          scale: [0.93, 1],
          translateY: [15, 0],
          duration: 550,
          easing: "easeOutCubic",
        });

        anime({
          targets: textLayer,
          opacity: [0, 1],
          translateY: [12, 0],
          duration: 450,
          delay: 80,
          easing: "easeOutQuad",
        });
      });
      return;
    }

    // Desktop Transition: Choreographed 3D Shoe Arrival & Text Reveal
    import("animejs").then((mod) => {
      const anime = (mod as any).default || mod;

      // Incoming Text Layer Animation
      anime({
        targets: textLayer,
        opacity: [0, 1],
        translateY: [25, 0],
        duration: 650,
        easing: "easeOutCubic",
      });

      // Incoming Shoe Layer Animation (3D perspective easing)
      // Rotates from off-axis pose into resting hero pose
      const initialRotation = direction === 1 ? -15 : 6;
      const initialTranslateX = direction === 1 ? 40 : -40;

      anime({
        targets: shoeLayer,
        opacity: [0, 1],
        scale: [0.82, 1],
        rotateZ: [initialRotation, -4],
        rotateY: [14, 7],
        rotateX: [6, 2],
        translateX: [initialTranslateX, 0],
        translateZ: [0, 40],
        duration: 750,
        delay: 90, // Parallax delay: shoe visually arrives behind text then takes front
        easing: "easeOutCubic",
      });
    });
  }, [currentIndex, direction, reducedMotion, isMobile, textLayerRef, shoeLayerRef]);

  return {
    reducedMotion,
    isMobile,
  };
}
