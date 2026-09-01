import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { sanitizeString, detectSpamOrInjection } from "@/lib/security/sanitizer";
import { logSecurityEvent } from "@/lib/security/audit-logger";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(120),
  subject: z.string().max(150).optional().default("General Inquiry"),
  message: z.string().min(5).max(3000),
  honeypot: z.string().optional(), // bot trap
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  // 1. Rate Limit
  const rateLimit = checkRateLimit(`contact_${ip}`, {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many messages sent. Please wait before submitting again." },
      { status: 429 }
    );
  }

  // 2. Payload size check
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 50 * 1024) {
    // > 50 KB
    return NextResponse.json({ error: "Payload exceeds size limit" }, { status: 413 });
  }

  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form submission", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, subject, message, honeypot } = parsed.data;

    // 3. Spam, Honeypot and Injection Analysis
    const spamCheck = detectSpamOrInjection({ name, email, message, honeypot });
    if (spamCheck.isSpam) {
      logSecurityEvent({
        eventType: "RATE_LIMIT_EXCEEDED",
        actor: { ip },
        outcome: "BLOCKED",
        riskScore: 80,
        metadata: { reason: spamCheck.reason },
      });
      // Return 200 to confuse automated bots without storing/dispatching spam
      return NextResponse.json({ success: true, message: "Message received" });
    }

    // 4. Sanitize strings
    const cleanName = sanitizeString(name, 100);
    const cleanSubject = sanitizeString(subject, 150);
    const cleanMessage = sanitizeString(message, 3000);

    return NextResponse.json({
      success: true,
      message: "Thank you for contacting Cally Wear. Our concierge team will respond shortly.",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Message submission failed", details: errorMsg }, { status: 500 });
  }
}
