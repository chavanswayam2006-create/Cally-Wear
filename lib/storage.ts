import fs from "fs";
import path from "path";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function uploadProductImage(params: {
  sku: string;
  filename: string;
  fileBuffer: Buffer;
  contentType: string;
}): Promise<string> {
  const cleanSku = params.sku.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, "_");
  const cleanFilename = `${Date.now()}-${params.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  // If Supabase Storage is configured, upload to "products" bucket
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const storagePath = `${cleanSku}/${cleanFilename}`;
      const { data, error } = await supabaseAdmin.storage
        .from("products")
        .upload(storagePath, params.fileBuffer, {
          contentType: params.contentType,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from("products")
          .getPublicUrl(storagePath);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn("Supabase storage upload failed, falling back to local storage:", err);
    }
  }

  // Local fallback: write to public/uploads/products/
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products", cleanSku);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, cleanFilename);
  fs.writeFileSync(filePath, params.fileBuffer);

  return `/uploads/products/${cleanSku}/${cleanFilename}`;
}
