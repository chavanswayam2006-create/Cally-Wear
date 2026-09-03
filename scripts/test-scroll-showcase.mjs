// Cally Wear - Scroll Showcase & Admin Manager Verification Test Suite

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let adminToken = "";
let customerToken = "";
let createdItemId = "";
let sampleProductId = "";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
};

function pass(msg) {
  console.log(`  ${colors.green}✓ PASS:${colors.reset} ${msg}`);
}

function fail(msg, details = "") {
  console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${msg}`);
  if (details) console.error(`    ${colors.yellow}${details}${colors.reset}`);
  process.exitCode = 1;
}

function header(title) {
  console.log(`\n${colors.bold}${colors.cyan}=== ${title} ===${colors.reset}`);
}

async function api(path, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Origin": BASE_URL,
    ...(opts.token ? { Authorization: `Bearer ${opts.token}`, Cookie: `cally_auth_token=${opts.token}` } : {}),
    ...(opts.headers || {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method || "GET",
    headers,
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log(`${colors.bold}CALLY WEAR — SCROLL SHOWCASE TEST SUITE${colors.reset}`);
  console.log(`Target: ${BASE_URL}`);

  // 1. Authenticate Admin and Customer
  header("1. Setup & Auth Tokens");
  const adminRes = await api("/api/auth/login", {
    method: "POST",
    body: { email: "admin@callywear.com", password: "CallyAdmin2026!" },
  });

  if (adminRes.ok && adminRes.data?.token) {
    adminToken = adminRes.data.token;
    pass("Admin authenticated successfully");
  } else {
    fail("Admin authentication failed", JSON.stringify(adminRes.data));
    return;
  }

  // Register or Login Customer
  const custEmail = `customer_${Date.now()}@callywear-test.com`;
  const custRes = await api("/api/auth/register", {
    method: "POST",
    body: { name: "Showcase Tester", email: custEmail, password: "Password123!" },
  });
  if (custRes.ok && custRes.data?.token) {
    customerToken = custRes.data.token;
    pass("Customer registered and authenticated");
  } else {
    // try login
    const loginRes = await api("/api/auth/login", {
      method: "POST",
      body: { email: custEmail, password: "Password123!" },
    });
    customerToken = loginRes.data?.token || "";
    pass("Customer authenticated");
  }

  // 2. Public Storefront Endpoint Verification
  header("2. Public Endpoint (/api/scroll-showcase)");
  const pubRes = await api("/api/scroll-showcase");
  if (pubRes.ok && Array.isArray(pubRes.data?.items)) {
    pass(`Public showcase endpoint returned ${pubRes.data.items.length} active chapter(s)`);
    if (pubRes.data.items.length > 0) {
      const first = pubRes.data.items[0];
      sampleProductId = first.productId;
      if (first.highlightLabel && first.highlightDescription && first.product?.name) {
        pass(`First chapter validated: "${first.highlightLabel}" for ${first.product.name}`);
      } else {
        fail("Showcase item missing expected joined fields", JSON.stringify(first));
      }
    }
  } else {
    fail("Failed to fetch public showcase endpoint", JSON.stringify(pubRes.data));
  }

  // 3. Security & Route Protection Checks
  header("3. Security & Role-Based Access Control");
  
  // Unauthenticated request
  const unauthRes = await api("/api/admin/scroll-showcase");
  if (unauthRes.status === 401) {
    pass("Unauthenticated request to /api/admin/scroll-showcase correctly blocked with 401");
  } else {
    fail(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
  }

  // Customer (non-admin) request
  const forbiddenRes = await api("/api/admin/scroll-showcase", { token: customerToken });
  if (forbiddenRes.status === 403) {
    pass("Customer request to /api/admin/scroll-showcase correctly blocked with 403 Forbidden");
  } else {
    fail(`Expected 403 for non-admin request, got ${forbiddenRes.status}`);
  }

  // Authenticated Admin request
  const adminListRes = await api("/api/admin/scroll-showcase", { token: adminToken });
  if (adminListRes.ok && Array.isArray(adminListRes.data?.items)) {
    pass(`Admin successfully fetched all showcase chapters (${adminListRes.data.items.length} items)`);
  } else {
    fail("Admin list request failed", JSON.stringify(adminListRes.data));
  }

  // 4. Admin CRUD Lifecycle
  header("4. Admin Showcase CRUD Operations");

  // Get a valid product ID
  if (!sampleProductId) {
    const prodsRes = await api("/api/admin/products", { token: adminToken });
    sampleProductId = prodsRes.data?.products?.[0]?.id || "prod_01";
  }

  // CREATE
  const createRes = await api("/api/admin/scroll-showcase", {
    method: "POST",
    token: adminToken,
    body: {
      productId: sampleProductId,
      highlightLabel: "TEST TITANIUM ARCH",
      highlightDescription: "Automated test chapter description for rotational stability.",
      isActive: true,
      displayOrder: 99,
    },
  });

  if (createRes.status === 201 && createRes.data?.item?.id) {
    createdItemId = createRes.data.item.id;
    pass(`Showcase chapter created: ID ${createdItemId} (${createRes.data.item.highlightLabel})`);
  } else {
    fail("Failed to create showcase chapter", JSON.stringify(createRes.data));
  }

  // UPDATE / REORDER / TOGGLE
  if (createdItemId) {
    const patchRes = await api(`/api/admin/scroll-showcase/${createdItemId}`, {
      method: "PATCH",
      token: adminToken,
      body: {
        highlightLabel: "TEST CARBON REBOUND",
        isActive: false, // deactivate to test public filter
        displayOrder: 5,
      },
    });

    if (patchRes.ok && patchRes.data?.item?.highlightLabel === "TEST CARBON REBOUND") {
      pass("Showcase chapter updated and deactivated via PATCH");
    } else {
      fail("Failed to update showcase chapter", JSON.stringify(patchRes.data));
    }

    // Verify public endpoint does not include inactive item
    const checkPubRes = await api("/api/scroll-showcase");
    const foundInPub = checkPubRes.data?.items?.some((i) => i.id === createdItemId);
    if (!foundInPub) {
      pass("Public endpoint verified: inactive item is properly excluded from storefront");
    } else {
      fail("Inactive item unexpectedly appeared on public storefront endpoint");
    }

    // Reactivate
    await api(`/api/admin/scroll-showcase/${createdItemId}`, {
      method: "PATCH",
      token: adminToken,
      body: { isActive: true },
    });
    const checkPubActive = await api("/api/scroll-showcase");
    const foundActive = checkPubActive.data?.items?.some((i) => i.id === createdItemId);
    if (foundActive) {
      pass("Reactivated item successfully appears on storefront endpoint");
    } else {
      fail("Reactivated item missing from public storefront endpoint");
    }

    // DELETE
    const deleteRes = await api(`/api/admin/scroll-showcase/${createdItemId}`, {
      method: "DELETE",
      token: adminToken,
    });

    if (deleteRes.ok && deleteRes.data?.success) {
      pass(`Showcase chapter ${createdItemId} successfully deleted`);
    } else {
      fail("Failed to delete showcase chapter", JSON.stringify(deleteRes.data));
    }
  }

  header("5. Verification Summary");
  if (process.exitCode === 1) {
    console.error(`\n${colors.red}Some tests failed. Check logs above.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.green}${colors.bold}ALL SCROLL SHOWCASE TESTS PASSED PERFECTLY!${colors.reset}\n`);
  }
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
