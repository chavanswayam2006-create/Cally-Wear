import { NextRequest, NextResponse } from "next/server";
import { validateRequestOrigin } from "./lib/security/origin";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // State-changing HTTP methods on API routes
  if (pathname.startsWith("/api/") && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    // Webhook endpoints use HMAC signature verification instead of origin checks
    const isWebhook = pathname.startsWith("/api/webhooks/");
    if (!isWebhook) {
      const host = req.headers.get("host") || "localhost:3000";
      const originValidation = validateRequestOrigin(req.headers, host);

      if (!originValidation.valid) {
        return NextResponse.json(
          { error: "Cross-Origin Request Blocked (CSRF protection violation)", reason: originValidation.reason },
          { status: 403 }
        );
      }
    }
  }

  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
