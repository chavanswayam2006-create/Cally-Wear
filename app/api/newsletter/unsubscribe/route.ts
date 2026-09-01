import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/security/database";
import { verifySignedToken } from "@/lib/security/token";

const unsubscribeSchema = z.object({
  token: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = unsubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid unsubscribe request" }, { status: 400 });
    }

    const { token } = parsed.data;
    const verification = verifySignedToken<{ email: string; action: string }>(token);

    if (!verification.valid || !verification.payload || verification.payload.action !== "unsubscribe") {
      return NextResponse.json(
        { error: "Invalid, tampered, or expired unsubscribe token." },
        { status: 400 }
      );
    }

    const record = db.newsletter.get(verification.payload.email);
    if (record) {
      record.status = "unsubscribed";
      db.newsletter.save(record);
    }

    return NextResponse.json({
      success: true,
      message: "You have been successfully unsubscribed from Cally Wear marketing emails.",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Unsubscribe failed", details: errorMsg }, { status: 500 });
  }
}
