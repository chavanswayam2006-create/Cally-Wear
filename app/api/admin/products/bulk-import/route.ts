import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Papa from "papaparse";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export interface BulkImportItem {
  name: string;
  sku: string;
  slug?: string;
  basePrice: number;
  salePrice?: number | null;
  isOnSale?: boolean;
  description?: string;
  materials?: string;
  sizes?: string; // Comma-separated sizes e.g. "UK 7:15, UK 8:20, UK 9:18" or "UK 7, UK 8"
  images?: string; // Comma-separated image URLs
  status?: "DRAFT" | "PUBLISHED";
  sectionSlugs?: string; // Comma-separated section slugs
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();

    const mode = body.mode || "validate"; // "validate" | "commit"
    let rawItems: any[] = [];

    if (body.csvText) {
      const parsed = Papa.parse(body.csvText, {
        header: true,
        skipEmptyLines: true,
      });
      rawItems = parsed.data;
    } else if (Array.isArray(body.items)) {
      rawItems = body.items;
    } else {
      return NextResponse.json(
        { error: "Provide either csvText or items array" },
        { status: 400 }
      );
    }

    const validationResults: Array<{
      index: number;
      sku: string;
      name: string;
      valid: boolean;
      errors: string[];
      parsedItem: any;
    }> = [];

    const existingProducts = await db.product.findMany({});
    const existingSkus = new Set(existingProducts.map((p: any) => p.sku.toUpperCase()));
    const existingSlugs = new Set(existingProducts.map((p: any) => p.slug));
    const currentBatchSkus = new Set<string>();

    const allSections = await db.section.findMany({});
    const sectionMap = new Map<string, string>();
    allSections.forEach((s: any) => sectionMap.set(s.slug.toLowerCase(), s.id));

    for (let i = 0; i < rawItems.length; i++) {
      const row = rawItems[i];
      const errors: string[] = [];

      const name = String(row.name || "").trim();
      const sku = String(row.sku || "").toUpperCase().trim();
      const basePrice = Number(row.basePrice || row.price || 0);
      const salePrice = row.salePrice ? Number(row.salePrice) : null;
      const isOnSale = String(row.isOnSale || "").toLowerCase() === "true" || Boolean(salePrice && salePrice < basePrice);
      const description = String(row.description || `Premium ${name} by Cally Wear`).trim();
      const materials = String(row.materials || "Premium leather and rubber").trim();
      const status = String(row.status || "PUBLISHED").toUpperCase() === "DRAFT" ? "DRAFT" : "PUBLISHED";

      if (!name) errors.push("Product name is required");
      if (!sku) errors.push("SKU is required");
      if (basePrice <= 0 || isNaN(basePrice)) errors.push("Valid base price is required");

      if (sku) {
        if (existingSkus.has(sku)) {
          errors.push(`SKU "${sku}" already exists in database`);
        }
        if (currentBatchSkus.has(sku)) {
          errors.push(`Duplicate SKU "${sku}" found within import file`);
        }
        currentBatchSkus.add(sku);
      }

      // Generate or normalize slug
      let slug = (row.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^-|-$/g, "");
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${sku.toLowerCase()}`;
      }

      // Parse sizes and stock
      const rawSizes = String(row.sizes || "UK 7:10, UK 8:15, UK 9:15, UK 10:10");
      const variantList = rawSizes.split(",").map((part) => {
        const [sizeName, stockStr] = part.split(":").map((s) => s.trim());
        return {
          size: sizeName,
          stock: stockStr ? parseInt(stockStr, 10) || 10 : 10,
        };
      }).filter((v) => v.size);

      if (variantList.length === 0) {
        errors.push("At least one size variant is required");
      }

      // Parse images
      const rawImages = String(row.images || "");
      const imageList = rawImages
        ? rawImages.split(",").map((u, idx) => ({
            url: u.trim(),
            altText: `${name} view ${idx + 1}`,
            sortOrder: idx,
          })).filter((img) => img.url)
        : [
            {
              url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
              altText: `${name} preview`,
              sortOrder: 0,
            },
          ];

      // Parse section assignments
      const rawSections = String(row.sectionSlugs || row.sections || "new-arrivals");
      const sectionIds = rawSections
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .map((slug) => sectionMap.get(slug))
        .filter(Boolean) as string[];

      const discountPercent =
        isOnSale && salePrice && basePrice > 0
          ? Math.round(((basePrice - salePrice) / basePrice) * 100)
          : null;

      const parsedItem = {
        name,
        slug,
        sku,
        description,
        materials,
        basePrice,
        salePrice,
        isOnSale,
        discountPercent,
        status,
        variants: variantList,
        images: imageList,
        sectionIds,
      };

      validationResults.push({
        index: i,
        sku: sku || `ROW-${i + 1}`,
        name: name || "Unnamed Product",
        valid: errors.length === 0,
        errors,
        parsedItem,
      });
    }

    const allValid = validationResults.every((r) => r.valid);

    // If mode is validate, return the preview and validation status
    if (mode === "validate" || !allValid) {
      return NextResponse.json({
        mode: "validate",
        totalRows: rawItems.length,
        validRows: validationResults.filter((r) => r.valid).length,
        invalidRows: validationResults.filter((r) => !r.valid).length,
        canCommit: allValid && validationResults.length > 0,
        results: validationResults,
      });
    }

    // Commit mode: execute bulk creation in transaction
    const createdProducts: any[] = [];

    await db.$transaction(async (tx: any) => {
      for (const res of validationResults) {
        const item = res.parsedItem;
        const created = await tx.product.create({
          data: {
            name: item.name,
            slug: item.slug,
            sku: item.sku,
            description: item.description,
            materials: item.materials,
            basePrice: item.basePrice,
            salePrice: item.salePrice,
            isOnSale: item.isOnSale,
            discountPercent: item.discountPercent,
            status: item.status,
            variants: {
              create: item.variants.map((v: any) => ({
                size: v.size,
                stock: v.stock,
              })),
            },
            images: {
              create: item.images.map((img: any) => ({
                url: img.url,
                altText: img.altText,
                sortOrder: img.sortOrder,
              })),
            },
            sections: {
              create: item.sectionIds.map((secId: string) => ({
                sectionId: secId,
              })),
            },
          },
        });
        createdProducts.push(created);
      }
    });

    return NextResponse.json({
      success: true,
      mode: "commit",
      importedCount: createdProducts.length,
      message: `Successfully imported ${createdProducts.length} products into the catalog`,
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Bulk import failed", details: err.message }, { status: 500 });
  }
}
