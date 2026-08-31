"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "mark" | "wordmark-only";
  theme?: "dark" | "light" | "auto";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

export function Logo({
  variant = "full",
  theme = "auto",
  className,
  size = "md",
  href = "/",
}: LogoProps) {
  // TODO: swap for real logo from @cally_wear
  const [svgError, setSvgError] = useState(false);

  const sizeClasses = {
    sm: "text-lg tracking-tight",
    md: "text-2xl tracking-tighter",
    lg: "text-3xl tracking-tighter font-extrabold",
    xl: "text-4xl tracking-tighter font-black",
  };

  const imageDimensions = {
    sm: { width: 110, height: 24 },
    md: { width: 150, height: 32 },
    lg: { width: 190, height: 40 },
    xl: { width: 240, height: 50 },
  };

  const logoContent = (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 select-none font-display uppercase font-black transition-opacity hover:opacity-90",
        sizeClasses[size],
        className
      )}
    >
      {/* SVG Image attempt with graceful fallback */}
      {!svgError && variant !== "wordmark-only" ? (
        <div className="relative flex items-center">
          <Image
            src={variant === "mark" ? "/brand/logo-mark.svg" : "/brand/logo.svg"}
            alt="Cally Wear"
            width={variant === "mark" ? 36 : imageDimensions[size].width}
            height={variant === "mark" ? 36 : imageDimensions[size].height}
            className="h-auto max-h-10 w-auto object-contain"
            onError={() => setSvgError(true)}
            priority
          />
        </div>
      ) : (
        /* Typographic Wordmark Fallback */
        <div className="flex items-center leading-none tracking-tight">
          <span className="font-black italic tracking-tighter text-current">
            CALLY
          </span>
          <span className="ml-1 font-light tracking-widest text-[#E85D2C]">
            WEAR
          </span>
          <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-[#E85D2C]" />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Cally Wear Home" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D2C]">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
