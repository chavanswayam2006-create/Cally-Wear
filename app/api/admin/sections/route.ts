import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const sectionSchema = z.object({
  name: z.string().min(2, "Section name is required"),
  slug: z.string().min(2).optional(),
  sortOrder: z.number().int().default(0),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const sections = await db.section.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ sections });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to fetch sections", details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const rawBody = await req.json();
    const body = {
      ...rawBody,
      slug:
        rawBody.slug ||
        (rawBody.name
          ? rawBody.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
          : undefined),
    };
    const parsed = sectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, sortOrder } = parsed.data;
    const slug =
      parsed.data.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const existing = await db.section.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: `Section with slug "${slug}" already exists` }, { status: 400 });
    }

    const newSection = await db.section.create({
      data: { name, slug, sortOrder },
    });

    return NextResponse.json({
      success: true,
      section: newSection,
      message: "Section created successfully",
    }, { status: 201 });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to create section", details: err.message }, { status: 500 });
  }
}
