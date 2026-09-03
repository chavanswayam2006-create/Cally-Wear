import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const sections = await db.section.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ sections });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch sections", message: err.message },
      { status: 500 }
    );
  }
}
