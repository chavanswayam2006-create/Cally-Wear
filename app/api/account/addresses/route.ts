import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";

const addressSchema = z.object({
  label: z.string().optional().nullable(),
  line1: z.string().min(5, "Address is required"),
  line2: z.string().optional().nullable(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "PIN code must be 6 digits"),
  phone: z.string().min(10, "Phone number is required"),
  isDefault: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireCustomer(req);
    const addresses = await db.address.findMany({
      where: { profileId: user.id },
    });
    return NextResponse.json({ addresses });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to fetch addresses", details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireCustomer(req);
    const body = await req.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newAddress = await db.address.create({
      data: {
        profileId: user.id,
        label: parsed.data.label || null,
        line1: parsed.data.line1,
        line2: parsed.data.line2 || null,
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
        phone: parsed.data.phone,
        isDefault: parsed.data.isDefault,
      },
    });

    return NextResponse.json({ success: true, address: newAddress });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to create address", details: err.message }, { status: 500 });
  }
}
