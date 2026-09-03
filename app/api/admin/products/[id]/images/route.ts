import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { uploadProductImage } from "@/lib/storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";

    // If uploading a file (multipart/form-data)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const altText = (formData.get("altText") as string) || `${product.name} image`;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const publicUrl = await uploadProductImage({
        sku: product.sku,
        filename: file.name,
        fileBuffer: buffer,
        contentType: file.type || "image/jpeg",
      });

      const updatedImages = [
        ...product.images,
        {
          id: `img_${product.id}_${Date.now()}`,
          productId: product.id,
          url: publicUrl,
          altText,
          sortOrder: product.images.length,
        },
      ];

      const updated = await db.product.update({
        where: { id: product.id },
        data: {
          images: {
            create: updatedImages.map((img, idx) => ({
              url: img.url,
              altText: img.altText,
              sortOrder: idx,
            })),
          },
        },
      });

      return NextResponse.json({
        success: true,
        images: updated.images,
        uploadedUrl: publicUrl,
      });
    }

    // Otherwise handle JSON image reordering
    const body = await req.json();
    if (Array.isArray(body.images)) {
      const updated = await db.product.update({
        where: { id: product.id },
        data: {
          images: {
            create: body.images.map((img: any, idx: number) => ({
              url: img.url,
              altText: img.altText || `${product.name} image`,
              sortOrder: idx,
            })),
          },
        },
      });

      return NextResponse.json({
        success: true,
        images: updated.images,
      });
    }

    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to process images", details: err.message }, { status: 500 });
  }
}
