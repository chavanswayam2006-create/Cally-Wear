import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { FALLBACK_HERO_SLIDES } from "@/components/home/hero-showcase/types";

// Public storefront endpoint for Cinematic Hero Product Showcase
export async function GET() {
  try {
    const items = await db.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        product: true,
      },
    });

    // Zero-active-slides safety net: return fallback if empty so storefront never breaks
    const slides = items && items.length > 0 ? items : FALLBACK_HERO_SLIDES;

    return NextResponse.json(
      { slides },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("Error fetching public hero showcase items:", err);
    // On unexpected database error, safely return fallback slides
    return NextResponse.json(
      { slides: FALLBACK_HERO_SLIDES, warning: "Served from static fallback" },
      { status: 200 }
    );
  }
}
