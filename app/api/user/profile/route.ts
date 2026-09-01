import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/security/session";
import { db } from "@/lib/security/database";
import { sanitizeString } from "@/lib/security/sanitizer";

// Strict Whitelist Schema for Profile Updates (Property-Level Authorization)
const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(20).optional(),
  addresses: z
    .array(
      z.object({
        id: z.string(),
        isDefault: z.boolean(),
        name: z.string(),
        street: z.string(),
        city: z.string(),
        state: z.string(),
        pincode: z.string(),
        phone: z.string(),
      })
    )
    .optional(),
});

export async function PUT(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get("x-session-id") || "";
  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const user = db.users.findById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid profile data", details: parsed.error.format() }, { status: 400 });
    }

    // PROPERTY-LEVEL AUTHORIZATION:
    // Whitelisted fields only. Injected fields (role, isVip, passwordHash, etc.) are strictly excluded.
    if (parsed.data.name !== undefined) {
      user.name = sanitizeString(parsed.data.name, 80);
    }
    if (parsed.data.phone !== undefined) {
      user.phone = sanitizeString(parsed.data.phone, 20);
    }
    if (parsed.data.addresses !== undefined) {
      user.addresses = parsed.data.addresses;
    }

    db.users.save(user);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role, // role remains unchanged by client input
        addresses: user.addresses,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Profile update failed", details: errorMsg }, { status: 500 });
  }
}
