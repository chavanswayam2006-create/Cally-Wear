import { NextRequest, NextResponse } from "next/server";
import { validateRequestOrigin } from "./lib/security/origin";

const AUTH_COOKIE_NAME = "cally_auth_token";

// Helper to decode JWT payload without heavy crypto library inside Edge Middleware
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(payloadBase64);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // 1. Existing CSRF / Origin validation for state-changing API routes
  if (pathname.startsWith("/api/") && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    const isWebhook = pathname.startsWith("/api/webhooks/") || pathname.startsWith("/api/payments/webhook");
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

  // 2. Extract Auth Token from Cookie or Bearer header
  let token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  const payload = token ? decodeJwtPayload(token) : null;
  const isAdminOrStaff = payload && (payload.role === "ADMIN" || payload.role === "STAFF");

  // 3. Admin API Route Protection (/api/admin/*)
  if (pathname.startsWith("/api/admin")) {
    if (!token || !payload) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    if (!isAdminOrStaff) {
      return NextResponse.json(
        { error: "Forbidden. Admin privileges required." },
        { status: 403 }
      );
    }
  }

  // 4. Admin UI Page Protection (/admin/*)
  // Exception: /admin/login is public
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAdminOrStaff) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
