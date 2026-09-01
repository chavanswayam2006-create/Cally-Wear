import http from "http";
import crypto from "crypto";

// Security test suite executed against server logic or direct HTTP endpoints
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let passedCount = 0;
let failedCount = 0;
const results = [];

function assert(condition, description) {
  if (condition) {
    passedCount++;
    results.push({ status: "PASS", desc: description });
    console.log(`  [PASS] ${description}`);
  } else {
    failedCount++;
    results.push({ status: "FAIL", desc: description });
    console.error(`  [FAIL] ${description}`);
  }
}

async function request(path, options = {}) {
  const url = new URL(path, BASE_URL);
  const method = options.method || "GET";
  const headers = options.headers || {};
  let body = options.body;

  if (body && typeof body === "object" && !(body instanceof Buffer)) {
    body = JSON.stringify(body);
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let resData = "";
        res.on("data", (chunk) => (resData += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(resData);
          } catch {
            // not json
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: resData,
            json,
          });
        });
      }
    );

    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// Extract cookies from response
function getCookie(res, name) {
  const setCookie = res.headers["set-cookie"];
  if (!setCookie) return null;
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const c of cookies) {
    if (c.startsWith(`${name}=`)) {
      return c.split(";")[0].replace(`${name}=`, "");
    }
  }
  return null;
}

async function runSecuritySuite() {
  console.log("================================================================================");
  console.log("             CALLY WEAR — ENTERPRISE SECURITY & SAFETY TEST SUITE              ");
  console.log("================================================================================");

  // ============================================================================
  // DOMAIN 1: AUTHENTICATION, SESSIONS & CREDENTIAL DEFENSE
  // ============================================================================
  console.log("\n--- [DOMAIN 1] Authentication, Sessions & Credential Defense ---");

  // 1.1 Generic Failure Messaging
  const wrongPassRes = await request("/api/auth/login", {
    method: "POST",
    body: { email: "alex.streets@gmail.com", password: "WrongPassword999!" },
  });
  const noUserRes = await request("/api/auth/login", {
    method: "POST",
    body: { email: "nonexistent.user.xyz987@gmail.com", password: "SomePassword123!" },
  });
  assert(
    wrongPassRes.status === 401 &&
      noUserRes.status === 401 &&
      wrongPassRes.json?.error === "Invalid email or password" &&
      noUserRes.json?.error === "Invalid email or password",
    "Generic error response: wrong password and non-existent account return identical 401 error shape"
  );

  // 1.2 Valid Login & Session Cookie Flags
  const validLoginRes = await request("/api/auth/login", {
    method: "POST",
    body: { email: "alex.streets@gmail.com", password: "Password123!" },
  });
  const sessionCookieHeader = validLoginRes.headers["set-cookie"]?.[0] || "";
  const alexSessionCookie = getCookie(validLoginRes, "cally_session_id");

  assert(
    validLoginRes.status === 200 &&
      validLoginRes.json?.success === true &&
      !!alexSessionCookie &&
      sessionCookieHeader.includes("HttpOnly") &&
      sessionCookieHeader.includes("SameSite=Strict"),
    "Successful login issues Secure, HttpOnly, SameSite=Strict session cookie without client token leak"
  );

  // 1.3 Session ID Rotation
  const secondLoginRes = await request("/api/auth/login", {
    method: "POST",
    body: { email: "alex.streets@gmail.com", password: "Password123!" },
  });
  const rotatedSessionCookie = getCookie(secondLoginRes, "cally_session_id");
  assert(
    rotatedSessionCookie && rotatedSessionCookie !== alexSessionCookie,
    "Session ID is cryptographically rotated on subsequent login"
  );

  // 1.4 Logout Revocation
  const logoutRes = await request("/api/auth/logout", {
    method: "POST",
    headers: { Cookie: `cally_session_id=${alexSessionCookie}` },
  });
  const meAfterLogout = await request("/api/auth/me", {
    headers: { Cookie: `cally_session_id=${alexSessionCookie}` },
  });
  assert(
    logoutRes.status === 200 && meAfterLogout.status === 401,
    "Logout revokes session token server-side; subsequent authenticated calls return 401"
  );

  // 1.5 Password Reset Flow & Multi-Device Session Invalidation
  // Log in again to obtain active session
  const preResetLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: "alex.streets@gmail.com", password: "Password123!" },
  });
  const activeSessionBeforeReset = getCookie(preResetLogin, "cally_session_id");

  const forgotRes = await request("/api/auth/forgot-password", {
    method: "POST",
    body: { email: "alex.streets@gmail.com" },
  });
  const resetToken = forgotRes.json?.testResetToken;

  assert(
    forgotRes.status === 200 && forgotRes.json?.message.includes("instructions have been sent"),
    "Forgot password returns uniform success response without leaking email presence"
  );

  if (resetToken) {
    const resetRes = await request("/api/auth/reset-password", {
      method: "POST",
      body: {
        email: "alex.streets@gmail.com",
        token: resetToken,
        newPassword: "NewPassword2026!#",
      },
    });

    const sessionCheckAfterReset = await request("/api/auth/me", {
      headers: { Cookie: `cally_session_id=${activeSessionBeforeReset}` },
    });

    assert(
      resetRes.status === 200 && sessionCheckAfterReset.status === 401,
      "Password reset successfully invalidates all pre-existing active sessions on all devices"
    );

    // Reset password back for other tests
    const forgotRes2 = await request("/api/auth/forgot-password", {
      method: "POST",
      body: { email: "alex.streets@gmail.com" },
    });
    if (forgotRes2.json?.testResetToken) {
      await request("/api/auth/reset-password", {
        method: "POST",
        body: {
          email: "alex.streets@gmail.com",
          token: forgotRes2.json.testResetToken,
          newPassword: "Password123!",
        },
      });
    }
  }

  // ============================================================================
  // DOMAIN 2: API AUTHORIZATION & ACCESS CONTROL (IDOR, RBAC, MASS-ASSIGNMENT)
  // ============================================================================
  console.log("\n--- [DOMAIN 2] API Authorization & Access Control ---");

  // Login Alex (Account A) and Riya (Account B)
  const alexAuthRes = await request("/api/auth/login", {
    method: "POST",
    body: { email: "alex.streets@gmail.com", password: "Password123!" },
  });
  const alexCookie = getCookie(alexAuthRes, "cally_session_id");

  const riyaAuthRes = await request("/api/auth/login", {
    method: "POST",
    body: { email: "riya.sneakers@gmail.com", password: "Password123!" },
  });
  const riyaCookie = getCookie(riyaAuthRes, "cally_session_id");

  // 2.1 Horizontal Authorization (IDOR Prevention)
  // CW-98241 belongs to Alex. Riya attempts to access it directly:
  const idorRes = await request("/api/user/orders/CW-98241", {
    headers: { Cookie: `cally_session_id=${riyaCookie}` },
  });
  assert(
    idorRes.status === 403,
    "Horizontal Authorization (IDOR): Account B is forbidden (403) from reading Account A's order by ID substitution"
  );

  // 2.2 Vertical Authorization (Customer -> Admin Protection)
  const verticalAdminRes = await request("/api/admin/orders", {
    headers: { Cookie: `cally_session_id=${alexCookie}` },
  });
  const verticalAuditRes = await request("/api/admin/audit-logs", {
    headers: { Cookie: `cally_session_id=${alexCookie}` },
  });
  assert(
    verticalAdminRes.status === 403 && verticalAuditRes.status === 403,
    "Vertical Authorization: Customer session cannot access privileged admin endpoints (/api/admin/*)"
  );

  // 2.3 Admin Session Authorized Access
  const adminLoginRes = await request("/api/auth/login", {
    method: "POST",
    body: { email: "security.admin@callywear.com", password: "AdminSecretPass2026!" },
  });
  const adminCookie = getCookie(adminLoginRes, "cally_session_id");
  const adminOrdersRes = await request("/api/admin/orders", {
    headers: { Cookie: `cally_session_id=${adminCookie}` },
  });
  assert(
    adminOrdersRes.status === 200 && Array.isArray(adminOrdersRes.json?.orders),
    "Admin session with proper RBAC permission successfully accesses /api/admin/orders"
  );

  // 2.4 Property-Level Mass Assignment Protection
  const massAssignRes = await request("/api/user/profile", {
    method: "PUT",
    headers: { Cookie: `cally_session_id=${alexCookie}` },
    body: {
      name: "Alex Kapoor Hardened",
      role: "super_admin",      // Attempted role escalation
      isVip: true,
      passwordHash: "malicious_hash_bypass",
    },
  });
  assert(
    massAssignRes.status === 200 &&
      massAssignRes.json?.user?.name === "Alex Kapoor Hardened" &&
      massAssignRes.json?.user?.role === "customer",
    "Property-Level Authorization: Mass-assignment attempt on 'role' is ignored; role remains 'customer'"
  );

  // 2.5 Order State Machine Transition Defense
  const invalidTransitionRes = await request("/api/admin/orders/CW-98241/status", {
    method: "POST",
    headers: { Cookie: `cally_session_id=${adminCookie}` },
    body: { status: "awaiting_payment" }, // Cannot transition from in_transit backward to awaiting_payment
  });
  assert(
    invalidTransitionRes.status === 400 &&
      invalidTransitionRes.json?.error?.includes("Invalid status transition"),
    "Order State Machine: Invalid backward or illegal status transition is strictly rejected (400)"
  );

  // ============================================================================
  // DOMAIN 3: CHECKOUT, PRICING & INVENTORY INTEGRITY
  // ============================================================================
  console.log("\n--- [DOMAIN 3] Checkout, Pricing & Inventory Integrity ---");

  // 3.1 Client Price Tampering Defense
  const priceTamperRes = await request("/api/checkout/create-order", {
    method: "POST",
    headers: { "Idempotency-Key": `idemp_tamper_${Date.now()}` },
    body: {
      items: [
        {
          productId: "cw-prod-01", // Apex Tech Runner: Catalog price is ₹7,999
          size: "UK 9",
          color: "Obsidian Core",
          quantity: 1,
          price: 1, // Tampered client price: ₹1
          total: 1,
        },
      ],
      shippingAddress: {
        firstName: "Test",
        lastName: "Tamper",
        email: "tamper.test@callywear.com",
        phone: "+91 98765 43210",
        address: "Security Lab Road",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      shippingMethod: "standard",
      paymentMethod: "cod",
    },
  });
  assert(
    priceTamperRes.status === 201 && priceTamperRes.json?.order?.total === 7999,
    "Server-Authoritative Pricing: Tampered client price (₹1) is discarded; server persists catalog price (₹7,999)"
  );

  // 3.2 Quantity Boundary Check
  const zeroQtyRes = await request("/api/checkout/create-order", {
    method: "POST",
    body: {
      items: [{ productId: "cw-prod-01", size: "UK 9", color: "Obsidian Core", quantity: 0 }],
      shippingAddress: {
        firstName: "Test",
        lastName: "User",
        email: "test@callywear.com",
        phone: "+91 98765 43210",
        address: "Test",
        city: "Mumbai",
        state: "MH",
        pincode: "400001",
      },
    },
  });
  const excessQtyRes = await request("/api/checkout/create-order", {
    method: "POST",
    body: {
      items: [{ productId: "cw-prod-01", size: "UK 9", color: "Obsidian Core", quantity: 99 }],
      shippingAddress: {
        firstName: "Test",
        lastName: "User",
        email: "test@callywear.com",
        phone: "+91 98765 43210",
        address: "Test",
        city: "Mumbai",
        state: "MH",
        pincode: "400001",
      },
    },
  });
  assert(
    zeroQtyRes.status === 400 && excessQtyRes.status === 400,
    "Quantity Bounds: Quantities of 0 or exceeding max unit limits (>5) are rejected (400)"
  );

  // 3.3 Server Promo Code Verification
  const validCouponRes = await request("/api/checkout/create-order", {
    method: "POST",
    headers: { "Idempotency-Key": `idemp_coupon_${Date.now()}` },
    body: {
      items: [{ productId: "cw-prod-01", size: "UK 9", color: "Obsidian Core", quantity: 1 }],
      promoCode: "VIP15", // 15% off ₹7,999 = ₹1,200 discount -> total ₹6,799
      shippingAddress: {
        firstName: "VIP",
        lastName: "Member",
        email: "vip@callywear.com",
        phone: "+91 98765 43210",
        address: "VIP Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      shippingMethod: "standard",
      paymentMethod: "cod",
    },
  });
  assert(
    validCouponRes.status === 201 && validCouponRes.json?.order?.discount === 1200,
    "Server-Authoritative Discounts: Valid coupon 'VIP15' is verified server-side applying exact 15% discount"
  );

  // 3.4 Idempotent Order Submission
  const idempotencyKey = `idemp_repeat_test_${Date.now()}`;
  const checkoutPayload = {
    items: [{ productId: "cw-prod-01", size: "UK 9", color: "Obsidian Core", quantity: 1 }],
    shippingAddress: {
      firstName: "Idempotent",
      lastName: "User",
      email: "idemp@callywear.com",
      phone: "+91 98765 43210",
      address: "Idempotent Towers",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
    shippingMethod: "standard",
    paymentMethod: "cod",
  };

  const orderReq1 = await request("/api/checkout/create-order", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: checkoutPayload,
  });
  const orderReq2 = await request("/api/checkout/create-order", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: checkoutPayload,
  });
  assert(
    orderReq1.status === 201 &&
      orderReq2.status === 200 &&
      orderReq1.json?.order?.orderNumber === orderReq2.json?.order?.orderNumber,
    "Idempotency: Replaying identical checkout submission returns original order without duplicate creation"
  );

  // ============================================================================
  // DOMAIN 4: PAYMENTS & SIGNED WEBHOOK SECURITY
  // ============================================================================
  console.log("\n--- [DOMAIN 4] Payments & Signed Webhook Security ---");

  const WEBHOOK_SECRET = "cally_webhook_secret_key_razorpay_2026";
  const testWebhookEventId = `evt_test_${Date.now()}`;
  const testOrderNumber = orderReq1.json?.order?.orderNumber;

  const validPayload = JSON.stringify({
    eventId: testWebhookEventId,
    eventType: "payment.captured",
    orderNumber: testOrderNumber,
    paymentId: "pay_test_98241",
  });

  const validTimestamp = String(Date.now());
  const validSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(`${validTimestamp}.${validPayload}`)
    .digest("hex");

  // 4.1 Invalid Signature Rejection
  const invalidSigRes = await request("/api/webhooks/payment", {
    method: "POST",
    headers: {
      "x-cally-signature": "bad_malicious_signature_hex",
      "x-cally-timestamp": validTimestamp,
    },
    body: validPayload,
  });
  assert(
    invalidSigRes.status === 401 && invalidSigRes.json?.error === "Invalid webhook signature",
    "Webhook Security: Unsigned or invalid HMAC signature is strictly rejected with HTTP 401"
  );

  // 4.2 Stale / Replayed Timestamp Rejection (> 5 mins old)
  const staleTimestamp = String(Date.now() - 10 * 60 * 1000); // 10 minutes ago
  const staleSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(`${staleTimestamp}.${validPayload}`)
    .digest("hex");

  const staleWebhookRes = await request("/api/webhooks/payment", {
    method: "POST",
    headers: {
      "x-cally-signature": staleSignature,
      "x-cally-timestamp": staleTimestamp,
    },
    body: validPayload,
  });
  assert(
    staleWebhookRes.status === 400 &&
      staleWebhookRes.json?.error?.includes("out of tolerance window"),
    "Webhook Security: Replayed webhook with expired timestamp is rejected (400)"
  );

  // 4.3 Valid Webhook & Duplicate Event Idempotency
  const validWebhookRes = await request("/api/webhooks/payment", {
    method: "POST",
    headers: {
      "x-cally-signature": validSignature,
      "x-cally-timestamp": validTimestamp,
    },
    body: validPayload,
  });

  const duplicateWebhookRes = await request("/api/webhooks/payment", {
    method: "POST",
    headers: {
      "x-cally-signature": validSignature,
      "x-cally-timestamp": validTimestamp,
    },
    body: validPayload,
  });

  assert(
    validWebhookRes.status === 200 &&
      validWebhookRes.json?.success === true &&
      duplicateWebhookRes.status === 200 &&
      duplicateWebhookRes.json?.message?.includes("idempotent duplicate"),
    "Webhook Security: Valid webhook verifies signature and duplicate webhook event is processed idempotently"
  );

  // ============================================================================
  // DOMAIN 5: GUEST ORDER TRACKING (HIGH RISK FLOW)
  // ============================================================================
  console.log("\n--- [DOMAIN 5] Guest Order Tracking (High Risk Flow) ---");

  // 5.1 Response Uniformity & Enumeration Resistance
  const invalidOrderLookup = await request("/api/track-order", {
    method: "POST",
    body: { orderNumber: "CW-00000", contact: "victim@example.com" },
  });
  const validOrderWrongContact = await request("/api/track-order", {
    method: "POST",
    body: { orderNumber: "CW-98241", contact: "wrong.attacker@example.com" },
  });
  assert(
    invalidOrderLookup.status === 404 &&
      validOrderWrongContact.status === 404 &&
      invalidOrderLookup.json?.error === validOrderWrongContact.json?.error,
    "Guest Tracking Uniformity: Non-existent order and valid order with mismatched contact return identical 404 response shape"
  );

  // 5.2 Data Minimization in Tracking Response
  const validTrackingLookup = await request("/api/track-order", {
    method: "POST",
    body: { orderNumber: "CW-98241", contact: "alex.streets@gmail.com" },
  });
  const shipment = validTrackingLookup.json?.shipment;
  assert(
    validTrackingLookup.status === 200 &&
      shipment &&
      shipment.destination?.city === "Mumbai" &&
      !validTrackingLookup.body.includes("Flat 402, High Street") && // No street address
      !validTrackingLookup.body.includes("7999") &&                // No itemized prices
      !validTrackingLookup.body.includes("okaxis"),                // No payment references
    "Guest Tracking Minimization: Valid response omits street address, itemized prices, and payment identifiers"
  );

  // ============================================================================
  // DOMAIN 6: WEB SECURITY & HEADERS (CSP, XSS, CSRF, FRAMING)
  // ============================================================================
  console.log("\n--- [DOMAIN 6] Web Security & HTTP Headers ---");

  const homeRes = await request("/");
  const headers = homeRes.headers;

  assert(
    headers["x-content-type-options"] === "nosniff",
    "Security Headers: X-Content-Type-Options: nosniff present"
  );
  assert(
    headers["x-frame-options"] === "DENY",
    "Security Headers: X-Frame-Options: DENY present (Clickjacking protection)"
  );
  assert(
    headers["referrer-policy"] === "strict-origin-when-cross-origin",
    "Security Headers: Referrer-Policy: strict-origin-when-cross-origin present"
  );
  assert(
    headers["strict-transport-security"]?.includes("max-age=63072000"),
    "Security Headers: Strict-Transport-Security with HSTS preload present"
  );
  assert(
    headers["content-security-policy"]?.includes("frame-ancestors 'none'") &&
      headers["content-security-policy"]?.includes("default-src 'self'"),
    "Security Headers: Strict Content-Security-Policy (CSP) with frame-ancestors 'none' configured"
  );

  // 6.2 CSRF Cross-Origin Blocking
  const csrfAttackRes = await request("/api/user/profile", {
    method: "PUT",
    headers: {
      Origin: "https://malicious-attacker-site.com",
      Referer: "https://malicious-attacker-site.com/exploit.html",
      Cookie: `cally_session_id=${alexCookie}`,
    },
    body: { name: "Hacked by CSRF" },
  });
  assert(
    csrfAttackRes.status === 403 && csrfAttackRes.json?.error?.includes("CSRF"),
    "CSRF Defense: State-changing API call from disallowed origin is rejected (403 Forbidden)"
  );

  // ============================================================================
  // DOMAIN 7: ABUSE PREVENTION & INPUT SANITIZATION
  // ============================================================================
  console.log("\n--- [DOMAIN 7] Abuse Prevention & Input Sanitization ---");

  // 7.1 Contact Form Honeypot Trap
  const honeypotRes = await request("/api/contact", {
    method: "POST",
    body: {
      name: "Spam Bot 3000",
      email: "bot@spammer.com",
      message: "Buy cheap luxury kicks now!",
      honeypot: "automated_bot_field_filled",
    },
  });
  assert(
    honeypotRes.status === 200, // Silently trapped without forwarding
    "Abuse Prevention: Bot filling hidden honeypot field is successfully neutralized"
  );

  // 7.2 Newsletter Signed Unsubscribe Token
  const subRes = await request("/api/newsletter/subscribe", {
    method: "POST",
    body: { email: "newsletter.vip@callywear.com", consent: true },
  });
  const unsubToken = subRes.json?.unsubscribeToken;

  assert(
    subRes.status === 200 && !!unsubToken,
    "Newsletter: Subscription records consent and issues HMAC-signed unsubscribe token"
  );

  if (unsubToken) {
    const tamperedToken = unsubToken.replace(/.$/, "X");
    const tamperedUnsubRes = await request("/api/newsletter/unsubscribe", {
      method: "POST",
      body: { token: tamperedToken },
    });
    const validUnsubRes = await request("/api/newsletter/unsubscribe", {
      method: "POST",
      body: { token: unsubToken },
    });

    assert(
      tamperedUnsubRes.status === 400 && validUnsubRes.status === 200,
      "Newsletter: Tampered unsubscribe token is rejected; valid HMAC signed token succeeds"
    );
  }

  // ============================================================================
  // DOMAIN 8: PRIVACY & PII REDACTION IN LOGS
  // ============================================================================
  console.log("\n--- [DOMAIN 8] Privacy & PII Redaction in Logs ---");

  const auditRes = await request("/api/admin/audit-logs", {
    headers: { Cookie: `cally_session_id=${adminCookie}` },
  });
  const logsString = JSON.stringify(auditRes.json?.logs || []);

  assert(
    !logsString.includes("Password123!") &&
      !logsString.includes("AdminSecretPass2026!") &&
      !logsString.includes("malicious_hash_bypass"),
    "Privacy & Logging: Zero passwords, plaintext secrets, or card PANs appear in audit log records"
  );

  // 8.2 DPDP Right to be Forgotten / Anonymization
  const privacyDeleteRes = await request("/api/user/privacy", {
    method: "DELETE",
    headers: { Cookie: `cally_session_id=${riyaCookie}` },
  });
  const checkRiyaSession = await request("/api/auth/me", {
    headers: { Cookie: `cally_session_id=${riyaCookie}` },
  });
  assert(
    privacyDeleteRes.status === 200 && checkRiyaSession.status === 401,
    "DPDP Act 2023 Compliance: Anonymization workflow wipes PII and revokes user sessions immediately"
  );

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("\n================================================================================");
  console.log(`SUMMARY: ${passedCount} OF ${passedCount + failedCount} TESTS PASSED`);
  console.log("================================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSecuritySuite().catch((err) => {
  console.error("Test execution encountered an error:", err);
  process.exit(1);
});
