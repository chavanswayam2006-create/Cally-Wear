import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public endpoint for live storefront Signature Scroll Showcase
export async function GET() {
  try {
    const items = await db.scrollShowcaseItem.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        product: true,
      },
    });

    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("Error fetching public scroll showcase items:", err);
    return NextResponse.json(
      { error: "Failed to fetch showcase items", details: err.message },
      { status: 500 }
    );
  }
}
