import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";

const updateAddressSchema = z.object({
  label: z.string().optional().nullable(),
  line1: z.string().min(5).optional(),
  line2: z.string().optional().nullable(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincode: z.string().min(6).optional(),
  phone: z.string().min(10).optional(),
  isDefault: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCustomer(req);
    const { id } = await params;

    const existing = await db.address.findUnique({ where: { id } });
    if (!existing || existing.profileId !== user.id) {
      return NextResponse.json({ error: "Address not found or unauthorized" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateAddressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await db.address.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, address: updated });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to update address", details: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCustomer(req);
    const { id } = await params;

    const existing = await db.address.findUnique({ where: { id } });
    if (!existing || existing.profileId !== user.id) {
      return NextResponse.json({ error: "Address not found or unauthorized" }, { status: 404 });
    }

    await db.address.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Address deleted" });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to delete address", details: err.message }, { status: 500 });
  }
}
