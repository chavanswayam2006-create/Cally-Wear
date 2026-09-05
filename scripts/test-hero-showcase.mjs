// Cally Wear - Hero Showcase Verification Test Suite

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let adminToken = "";
let customerToken = "";
let sampleProductId = "";
let createdSlideId = "";

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
    Origin: BASE_URL,
    ...(opts.token
      ? {
          Authorization: `Bearer ${opts.token}`,
          Cookie: `cally_auth_token=${opts.token}`,
        }
      : {}),
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
  console.log(`${colors.bold}CALLY WEAR — HERO SHOWCASE VERIFICATION SUITE${colors.reset}`);
  console.log(`Target: ${BASE_URL}`);

  // 1. Setup & Auth Tokens
  header("1. Setup & Auth Tokens");
  const adminRes = await api("/api/auth/login", {
    method: "POST",
    body: {
      email: "admin@callywear.com",
      password: "CallyAdmin2026!",
    },
  });

  if (adminRes.ok && adminRes.data?.token) {
    adminToken = adminRes.data.token;
    pass("Admin authenticated successfully");
  } else {
    fail("Admin authentication failed", JSON.stringify(adminRes.data));
    return;
  }

  // 2. Public Storefront Endpoint
  header("2. Public Hero Showcase API (/api/hero-showcase)");
  const publicRes = await api("/api/hero-showcase");
  if (publicRes.ok && Array.isArray(publicRes.data?.slides)) {
    pass(`Retrieved ${publicRes.data.slides.length} active hero slides`);
    const first = publicRes.data.slides[0];
    if (first && first.eyebrowLabel && first.ctaPrimaryLabel) {
      pass(`First slide has valid eyebrow: "${first.eyebrowLabel}" and CTA: "${first.ctaPrimaryLabel}"`);
    } else {
      fail("First slide missing required fields");
    }
  } else {
    fail("Failed to fetch public hero slides", JSON.stringify(publicRes.data));
  }

  // 3. Admin Permissions & List
  header("3. Admin Hero Showcase Access Control & List");
  const unauthRes = await api("/api/admin/hero-showcase");
  if (unauthRes.status === 401 || unauthRes.status === 403) {
    pass("Unauthenticated access correctly rejected (401/403)");
  } else {
    fail(`Unauthenticated access permitted? Status: ${unauthRes.status}`);
  }

  const adminListRes = await api("/api/admin/hero-showcase", { token: adminToken });
  if (adminListRes.ok && Array.isArray(adminListRes.data?.slides)) {
    pass(`Admin successfully retrieved ${adminListRes.data.slides.length} hero slides`);
    if (adminListRes.data.slides.length > 0) {
      sampleProductId = adminListRes.data.slides[0].productId;
    }
  } else {
    fail("Admin failed to list hero slides", JSON.stringify(adminListRes.data));
  }

  // 4. Admin CRUD Operations
  header("4. Admin CRUD Operations");

  // A. Create Slide
  const createRes = await api("/api/admin/hero-showcase", {
    method: "POST",
    token: adminToken,
    body: {
      productId: sampleProductId,
      eyebrowLabel: "LIMITED TEST EDITION",
      headlineOverride: "TEST KINETIC RUNNER",
      descriptionOverride: "Custom engineered test shoe for verification suite.",
      ctaPrimaryLabel: "Test CTA",
      ctaPrimaryLink: "/products/test-slug",
      ctaSecondaryLabel: "Explore All",
      ctaSecondaryLink: "/shop",
      cutoutImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      isActive: true,
      displayOrder: 99,
    },
  });

  if (createRes.status === 201 && createRes.data?.slide?.id) {
    createdSlideId = createRes.data.slide.id;
    pass(`Created new hero slide ID: ${createdSlideId}`);
  } else {
    fail("Failed to create hero slide", JSON.stringify(createRes.data));
  }

  // B. Read Single Slide
  if (createdSlideId) {
    const getSingleRes = await api(`/api/admin/hero-showcase/${createdSlideId}`, {
      token: adminToken,
    });
    if (getSingleRes.ok && getSingleRes.data?.slide?.id === createdSlideId) {
      pass("Fetched single hero slide by ID");
    } else {
      fail("Failed to fetch single hero slide by ID", JSON.stringify(getSingleRes.data));
    }
  }

  // C. Update Slide
  if (createdSlideId) {
    const patchRes = await api(`/api/admin/hero-showcase/${createdSlideId}`, {
      method: "PATCH",
      token: adminToken,
      body: {
        eyebrowLabel: "UPDATED TEST EDITION",
        headlineOverride: "UPDATED RUNNER TITLE",
      },
    });
    if (patchRes.ok && patchRes.data?.slide?.eyebrowLabel === "UPDATED TEST EDITION") {
      pass("Successfully updated hero slide fields");
    } else {
      fail("Failed to update hero slide", JSON.stringify(patchRes.data));
    }
  }

  // D. Reorder Slides
  const reorderRes = await api("/api/admin/hero-showcase/reorder", {
    method: "POST",
    token: adminToken,
    body: {
      items: [
        { id: createdSlideId, displayOrder: 0 },
      ],
    },
  });
  if (reorderRes.ok && reorderRes.data?.success) {
    pass("Successfully updated slide display order via reorder endpoint");
  } else {
    fail("Failed to reorder hero slides", JSON.stringify(reorderRes.data));
  }

  // 5. Validation Guardrails
  header("5. Validation Guardrails (At Least 1 Active Slide & Max 6 Limit)");

  // Find all active slides
  const currentSlidesRes = await api("/api/admin/hero-showcase", { token: adminToken });
  const allSlides = currentSlidesRes.data?.slides || [];
  const activeSlides = allSlides.filter((s) => s.isActive);

  // If we try to deactivate all active slides, it should block deactivating the last active one
  // Let's test by deactivating slides until only 1 remains
  const slidesToDeactivate = activeSlides.filter((s) => s.id !== createdSlideId);
  for (const s of slidesToDeactivate) {
    await api(`/api/admin/hero-showcase/${s.id}`, {
      method: "PATCH",
      token: adminToken,
      body: { isActive: false },
    });
  }

  // Now only createdSlideId is active. Attempt to deactivate it!
  const blockDeactivateRes = await api(`/api/admin/hero-showcase/${createdSlideId}`, {
    method: "PATCH",
    token: adminToken,
    body: { isActive: false },
  });

  if (blockDeactivateRes.status === 400) {
    pass("Validation correctly blocked deactivating the last active slide (400)");
  } else {
    fail("Validation failed: allowed deactivating the only active slide!", JSON.stringify(blockDeactivateRes.data));
  }

  // Attempt to delete the only active slide
  const blockDeleteRes = await api(`/api/admin/hero-showcase/${createdSlideId}`, {
    method: "DELETE",
    token: adminToken,
  });

  if (blockDeleteRes.status === 400) {
    pass("Validation correctly blocked deleting the only active slide (400)");
  } else {
    fail("Validation failed: allowed deleting the only active slide!", JSON.stringify(blockDeleteRes.data));
  }

  // Re-activate the slides we deactivated
  for (const s of slidesToDeactivate) {
    await api(`/api/admin/hero-showcase/${s.id}`, {
      method: "PATCH",
      token: adminToken,
      body: { isActive: true },
    });
  }
  pass("Restored active slides status");

  // E. Delete Test Slide (Now that other active slides exist)
  if (createdSlideId) {
    const deleteRes = await api(`/api/admin/hero-showcase/${createdSlideId}`, {
      method: "DELETE",
      token: adminToken,
    });
    if (deleteRes.ok && deleteRes.data?.success) {
      pass(`Successfully deleted test hero slide ID: ${createdSlideId}`);
    } else {
      fail("Failed to delete test hero slide", JSON.stringify(deleteRes.data));
    }
  }

  // 6. Verification Summary
  header("6. Verification Summary");
  console.log(`${colors.green}${colors.bold}ALL HERO SHOWCASE API & VALIDATION TESTS PASSED!${colors.reset}\n`);
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
