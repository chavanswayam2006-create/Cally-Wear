import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/security/database";

const schema = z.object({
  token: z.string().min(10),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
    }

    const user = db.users.findByEmail(parsed.data.email);
    if (
      !user ||
      !user.emailVerificationToken ||
      user.emailVerificationToken !== parsed.data.token ||
      (user.emailVerificationExp && Date.now() > user.emailVerificationExp)
    ) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExp = undefined;
    db.users.save(user);

    return NextResponse.json({ success: true, message: "Email successfully verified" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Verification failed", details: errorMsg }, { status: 500 });
  }
}
