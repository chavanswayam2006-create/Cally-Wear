import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/security/database";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { signToken } from "@/lib/security/token";

const subscribeSchema = z.object({
  email: z.string().email().max(120),
  consent: z.boolean().refine((val) => val === true, {
    message: "Marketing consent is required",
  }),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  const rateLimit = checkRateLimit(`news_${ip}`, {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many subscription attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid email address and consent are required." },
        { status: 400 }
      );
    }

    const cleanEmail = parsed.data.email.toLowerCase().trim();

    // Generate signed HMAC unsubscribe token (valid for 1 year)
    const unsubscribeToken = signToken({ email: cleanEmail, action: "unsubscribe" }, 365 * 86400 * 1000);

    // Save consent event
    db.newsletter.save({
      email: cleanEmail,
      status: "confirmed",
      consentTimestamp: Date.now(),
      consentIp: ip,
      unsubscribeToken,
    });

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to Cally Wear priority drop alerts.",
      unsubscribeToken,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Subscription failed", details: errorMsg }, { status: 500 });
  }
}
