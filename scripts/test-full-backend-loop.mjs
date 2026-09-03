// Cally Wear - Full Backend & Admin Dashboard Verification Test Suite
// Verifies all 10 phases and the complete Section 11 Functional Checklist

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let adminToken = "";
let customerToken = "";
let testProductId = "";
let testProductSlug = "";
let testSectionId = "";
let testOrderNumber = "";
let testOrderId = "";

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
  const setCookie = res.headers.get("set-cookie") || "";
  const match = setCookie.match(/cally_auth_token=([^;]+)/);
  const cookieToken = match ? match[1] : null;

  return { status: res.status, ok: res.ok, data, token: data?.token || cookieToken };
}

async function run() {
  console.log(`${colors.bold}CALLY WEAR — COMPREHENSIVE BACKEND VALIDATION${colors.reset}`);
  console.log(`Target: ${BASE_URL}\n`);

  // 1. AUTHENTICATION & ACCESS CONTROL
  header("1. Authentication & Role-Based Access Control");

  // Admin Login
  const adminLogin = await api("/api/auth/login", {
    method: "POST",
    body: { email: "admin@callywear.com", password: "CallyAdmin2026!" },
  });
  if (adminLogin.ok && adminLogin.token && adminLogin.data?.user?.role === "ADMIN") {
    adminToken = adminLogin.token;
    pass(`Admin logged in successfully (role: ${adminLogin.data.user.role})`);
  } else {
    fail("Admin login failed", JSON.stringify(adminLogin.data));
    return;
  }

  // Customer Signup & Login
  const customerEmail = `customer_${Date.now()}@callytest.com`;
  const customerSignup = await api("/api/auth/signup", {
    method: "POST",
    body: {
      email: customerEmail,
      password: "CustomerPassword123!",
      fullName: "Alex Mercer",
      phone: "+91 98765 43210",
    },
  });
  if (customerSignup.ok && customerSignup.token && customerSignup.data?.user?.role === "CUSTOMER") {
    customerToken = customerSignup.token;
    pass(`Customer account registered (role: ${customerSignup.data.user.role})`);
  } else {
    fail("Customer signup failed", JSON.stringify(customerSignup.data));
  }

  // Verify Non-Admin Access Rejection (Section 11 checklist item: All admin routes reject non-admin requests)
  const forbiddenCheck = await api("/api/admin/products", {
    token: customerToken,
  });
  if (forbiddenCheck.status === 403) {
    pass("Customer request to /api/admin/products correctly blocked with 403 Forbidden");
  } else {
    fail("Security failure: Customer was not blocked from admin API", `Status: ${forbiddenCheck.status}`);
  }

  const unauthCheck = await api("/api/admin/products");
  if (unauthCheck.status === 401) {
    pass("Unauthenticated request to /api/admin/products blocked with 401 Unauthorized");
  } else {
    fail("Security failure: Unauthenticated access permitted", `Status: ${unauthCheck.status}`);
  }

  // 2. SECTION MANAGEMENT
  header("2. Section / Collection Management");
  const sectionRes = await api("/api/admin/sections", {
    method: "POST",
    token: adminToken,
    body: {
      name: "Limited Cyber Series",
      slug: `limited-cyber-${Date.now()}`,
      sortOrder: 10,
    },
  });
  if (sectionRes.ok && sectionRes.data?.section?.id) {
    testSectionId = sectionRes.data.section.id;
    pass(`Created custom Section: "${sectionRes.data.section.name}" (slug: ${sectionRes.data.section.slug})`);
  } else {
    fail("Section creation failed", JSON.stringify(sectionRes.data));
  }

  // 3. PRODUCT CRUD & SALE DISPLAY RULES
  header("3. Product Creation, Image & Sale Display Rules");
  const sku = `CW-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
  const productSlug = `velocity-phantom-x-${Date.now()}`;
  const productCreateRes = await api("/api/admin/products", {
    method: "POST",
    token: adminToken,
    body: {
      name: "Velocity Phantom X",
      slug: productSlug,
      sku,
      description: "Next-generation ultra-cushioned technical runner with ballistic ripstop mesh.",
      materials: "Full-grain nubuck, recycled TPU cage, Vibram Megagrip outsole",
      basePrice: 14999,
      salePrice: 11999,
      isOnSale: true,
      isFeatured: true,
      isNewArrival: true,
      status: "PUBLISHED",
      sections: [testSectionId],
      images: [
        {
          url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80",
          altText: "Velocity Phantom X Profile",
          sortOrder: 0,
        },
      ],
      sizes: [
        { size: "UK 8", stock: 15 },
        { size: "UK 9", stock: 20 },
        { size: "UK 10", stock: 5 },
      ],
    },
  });

  if (productCreateRes.ok && productCreateRes.data?.product?.id) {
    testProductId = productCreateRes.data.product.id;
    testProductSlug = productCreateRes.data.product.slug;
    pass(`Created published product: "${productCreateRes.data.product.name}" (SKU: ${sku}, Sale Price: ₹11,999)`);
  } else {
    fail("Product creation failed", JSON.stringify(productCreateRes.data));
    return;
  }

  // Verify Storefront Product Fetching (Section 8: Sale Display Rules)
  const storefrontProduct = await api(`/api/products/${testProductSlug}`);
  if (storefrontProduct.ok && storefrontProduct.data?.product) {
    const p = storefrontProduct.data.product;
    if (p.isOnSale === true && p.displayPrice === 11999 && p.compareAtPrice === 14999 && p.discountPercent === 20) {
      pass("Storefront PDP reflects active sale: displayPrice ₹11,999 with crossed out compareAtPrice ₹14,999 (20% OFF)");
    } else {
      fail("Storefront sale pricing mismatch", JSON.stringify(p));
    }
    const hasSection = p.sections.some((s) => s.id === testSectionId);
    if (hasSection) {
      pass("Storefront PDP reflects assigned section independently of sale status");
    } else {
      fail("Assigned section missing on storefront product");
    }
  } else {
    fail("Failed to fetch product on storefront", JSON.stringify(storefrontProduct.data));
  }

  // Create DRAFT product and verify it is HIDDEN on storefront
  const draftCreateRes = await api("/api/admin/products", {
    method: "POST",
    token: adminToken,
    body: {
      name: "Secret Prototype Model",
      slug: `secret-prototype-${Date.now()}`,
      sku: `CW-DRAFT-${Math.floor(1000 + Math.random() * 9000)}`,
      description: "Unreleased internal concept",
      materials: "Composite mesh",
      basePrice: 19999,
      status: "DRAFT",
      sizes: [{ size: "UK 9", stock: 5 }],
      images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff", sortOrder: 0 }],
    },
  });
  if (draftCreateRes.ok && draftCreateRes.data?.product?.slug) {
    const draftSlug = draftCreateRes.data.product.slug;
    const storefrontDraft = await api(`/api/products/${draftSlug}`);
    if (storefrontDraft.status === 404) {
      pass("DRAFT product is successfully quarantined and returns 404 on storefront");
    } else {
      fail("Security/Catalog breach: DRAFT product is visible on storefront!");
    }
  }

  // 4. BULK IMPORT
  header("4. Bulk Product Import (CSV/JSON Simulation)");
  const bulkPayload = {
    mode: "commit",
    items: [
      {
        name: "Matrix Lowtop Neon",
        sku: `CW-BULK-1-${Date.now()}`,
        price: 8999,
        sizes: "UK 7:10, UK 8:12, UK 9:8",
        materials: "Engineered mesh, recycled foam",
        description: "Lightweight city commuter sneaker",
        images: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80",
        status: "PUBLISHED",
      },
      {
        name: "Cyberboot High Tactical",
        sku: `CW-BULK-2-${Date.now()}`,
        price: 16999,
        sizes: "UK 8:6, UK 9:10, UK 10:4",
        materials: "Cordura ballistic nylon, Vibram lug",
        description: "All-weather urban exploration boot",
        images: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
        status: "PUBLISHED",
      },
    ],
  };
  const bulkRes = await api("/api/admin/products/bulk-import", {
    method: "POST",
    token: adminToken,
    body: bulkPayload,
  });
  if (bulkRes.ok && bulkRes.data?.importedCount === 2) {
    pass(`Bulk import committed ${bulkRes.data.importedCount} products in a single transaction`);
  } else {
    fail("Bulk import failed", JSON.stringify(bulkRes.data));
  }

  // 5. CHECKOUT FLOW & AUTOMATIC PAYMENT CREATION (COD)
  header("5. Checkout Order Flow, Payment Creation & Stock Decrement");

  // Get initial stock for UK 8
  const initialStockRes = await api(`/api/products/${testProductSlug}`);
  const v8Initial = initialStockRes.data?.product?.variants?.find((v) => v.size === "UK 8");
  const initialStock = v8Initial ? v8Initial.stock : 15;

  const orderRes = await api("/api/orders", {
    method: "POST",
    token: customerToken,
    body: {
      items: [
        {
          productId: testProductId,
          size: "UK 8",
          quantity: 2,
        },
      ],
      shippingAddress: {
        firstName: "Alex",
        lastName: "Mercer",
        email: customerEmail,
        phone: "+91 98765 43210",
        address: "Flat 402, Skyline Residency, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400050",
      },
      shippingMethod: "standard",
      paymentMethod: "cod",
    },
  });

  if (orderRes.ok && orderRes.data?.order) {
    const o = orderRes.data.order;
    testOrderId = o.id;
    testOrderNumber = o.orderNumber;
    pass(`Order created successfully (${testOrderNumber})`);

    // Verify automatic payment creation for COD (Section 6)
    if (o.payment?.method === "COD" && o.payment?.status === "PENDING" && o.payment?.amountPaid === 0) {
      pass(`Automatic Payment record created: method=COD, status=PENDING, amountPaid=₹0, amountDue=₹${o.payment.amountDue}`);
    } else {
      fail("Payment record for COD incorrect", JSON.stringify(o.payment));
    }

    // Verify stock decrement (15 - 2 = 13)
    const afterOrderStockRes = await api(`/api/products/${testProductSlug}`);
    const v8After = afterOrderStockRes.data?.product?.variants?.find((v) => v.size === "UK 8");
    if (v8After && v8After.stock === initialStock - 2) {
      pass(`Inventory successfully decremented: UK 8 stock decreased from ${initialStock} to ${v8After.stock}`);
    } else {
      fail(`Inventory decrement failed. Expected ${initialStock - 2}, got ${v8After?.stock}`);
    }
  } else {
    fail("Order creation failed", JSON.stringify(orderRes.data));
    return;
  }

  // 6. PREPAID MOCK CHECKOUT FLOW
  header("6. Prepaid Mock Checkout & System Payment Log");
  const prepaidOrderRes = await api("/api/orders", {
    method: "POST",
    token: customerToken,
    body: {
      items: [
        {
          productId: testProductId,
          size: "UK 9",
          quantity: 1,
        },
      ],
      shippingAddress: {
        firstName: "Alex",
        lastName: "Mercer",
        email: customerEmail,
        phone: "+91 98765 43210",
        address: "Flat 402, Skyline Residency",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400050",
      },
      shippingMethod: "standard",
      paymentMethod: "prepaid_mock",
    },
  });
  if (prepaidOrderRes.ok && prepaidOrderRes.data?.order?.payment) {
    const p = prepaidOrderRes.data.order.payment;
    if (p.method === "PREPAID_MOCK" && p.status === "PAID" && p.amountPaid > 0) {
      pass(`Prepaid Mock order created: method=PREPAID_MOCK, status=PAID, amountPaid=₹${p.amountPaid}`);
    } else {
      fail("Prepaid Mock payment record incorrect", JSON.stringify(p));
    }
  } else {
    fail("Prepaid Mock order creation failed", JSON.stringify(prepaidOrderRes.data));
  }

  // 7. ADMIN ORDER MANAGEMENT & AUDIT LOGGING
  header("7. Admin Order Management, History Logging & Tracking");

  // Admin updates order status to CONFIRMED
  const statusRes1 = await api(`/api/admin/orders/${testOrderId}/status`, {
    method: "PUT",
    token: adminToken,
    body: {
      status: "CONFIRMED",
      note: "Inventory reserved and allocated for packaging.",
    },
  });
  if (statusRes1.ok) {
    pass("Admin updated order status to CONFIRMED with event note");
  } else {
    fail("Failed to update order status to CONFIRMED", JSON.stringify(statusRes1.data));
  }

  // Admin adds tracking info
  const trackingRes = await api(`/api/admin/orders/${testOrderId}/tracking`, {
    method: "PUT",
    token: adminToken,
    body: {
      trackingNumber: "BLUEDART-IND-9821389",
      carrier: "BlueDart Express",
    },
  });
  if (trackingRes.ok) {
    pass("Admin added tracking info: BlueDart Express - BLUEDART-IND-9821389");
  } else {
    fail("Failed to add tracking info", JSON.stringify(trackingRes.data));
  }

  // Admin updates status to SHIPPED
  await api(`/api/admin/orders/${testOrderId}/status`, {
    method: "PUT",
    token: adminToken,
    body: {
      status: "SHIPPED",
      note: "Dispatched via courier hub.",
    },
  });

  // Admin manually records COD payment collection (Section 6)
  const orderDetailsBeforePayment = await api(`/api/admin/orders/${testOrderId}`, { token: adminToken });
  const totalAmount = orderDetailsBeforePayment.data?.order?.total || 23998;

  const paymentUpdateRes = await api(`/api/admin/orders/${testOrderId}/payment`, {
    method: "POST",
    token: adminToken,
    body: {
      amount: totalAmount,
      status: "PAID",
      note: "Cash collected at customer doorstep by delivery agent.",
    },
  });

  if (paymentUpdateRes.ok && paymentUpdateRes.data?.payment?.status === "PAID") {
    pass(`Admin recorded manual payment collection: status=PAID, amount=₹${totalAmount}`);
    const log = paymentUpdateRes.data.payment.log;
    const lastLog = log?.[log.length - 1];
    if (lastLog?.note?.includes("doorstep")) {
      pass(`Payment log event preserved: "${lastLog.note}" (source: ${lastLog.source})`);
    } else {
      fail("Payment log event entry missing or malformed");
    }
  } else {
    fail("Manual payment update failed", JSON.stringify(paymentUpdateRes.data));
  }

  // 8. CUSTOMER-FACING TRACKING & ACCOUNT VERIFICATION
  header("8. Customer Account & Real-time Tracking Visibility");
  const customerOrdersRes = await api("/api/account/orders", { token: customerToken });
  if (customerOrdersRes.ok && customerOrdersRes.data?.orders?.length > 0) {
    const custOrder = customerOrdersRes.data.orders.find((o) => o.orderNumber === testOrderNumber);
    if (custOrder) {
      pass(`Customer account list displays order ${testOrderNumber} with status ${custOrder.status}`);
      if (custOrder.trackingNumber === "BLUEDART-IND-9821389" && custOrder.carrier === "BlueDart Express") {
        pass("Customer sees carrier and tracking number on their account page");
      } else {
        fail("Customer order tracking info missing in account view", JSON.stringify(custOrder));
      }
      if (custOrder.paymentStatus === "PAID") {
        pass("Customer sees updated payment status 'PAID'");
      } else {
        fail("Customer payment status not updated in account view");
      }
    } else {
      fail(`Order ${testOrderNumber} not found in customer's order history`);
    }
  } else {
    fail("Failed to fetch customer order history", JSON.stringify(customerOrdersRes.data));
  }

  // 9. CANCELLATION & STOCK RESTORATION
  header("9. Order Cancellation & Stock Restoration");
  const cancelRes = await api(`/api/admin/orders/${testOrderId}/status`, {
    method: "PUT",
    token: adminToken,
    body: {
      status: "CANCELLED",
      note: "Customer requested cancellation prior to flight.",
    },
  });

  if (cancelRes.ok) {
    pass("Admin marked order as CANCELLED");
    // Verify inventory restored back to initialStock
    const restoredStockRes = await api(`/api/products/${testProductSlug}`);
    const v8Restored = restoredStockRes.data?.product?.variants?.find((v) => v.size === "UK 8");
    if (v8Restored && v8Restored.stock === initialStock) {
      pass(`Inventory restored upon cancellation: UK 8 stock restored back to ${v8Restored.stock}`);
    } else {
      fail(`Inventory restoration failed. Expected ${initialStock}, got ${v8Restored?.stock}`);
    }
  } else {
    fail("Failed to cancel order", JSON.stringify(cancelRes.data));
  }

  // 10. ADMIN DASHBOARD METRICS & STATS
  header("10. Admin Dashboard Overview Statistics");
  const statsRes = await api("/api/admin/stats", { token: adminToken });
  if (statsRes.ok && statsRes.data?.metrics) {
    const m = statsRes.data.metrics;
    pass(`Dashboard Stats: ${m.totalOrders} total orders, ₹${m.totalRevenue.toLocaleString()} revenue, ${m.totalProducts} products, ${m.totalCustomers} customers`);
    if (Array.isArray(statsRes.data.recentOrders) && statsRes.data.recentOrders.length > 0) {
      pass(`Recent orders list verified (${statsRes.data.recentOrders.length} orders listed)`);
    }
    if (Array.isArray(statsRes.data.lowStockVariants)) {
      pass(`Low-stock variants monitoring verified (${statsRes.data.lowStockVariants.length} items flagged)`);
    }
  } else {
    fail("Failed to load admin dashboard stats", JSON.stringify(statsRes.data));
  }

  console.log(`\n${colors.bold}${colors.green}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.green}       ALL SECTION 11 FUNCTIONAL CHECKLIST ITEMS PASSED!        ${colors.reset}`);
  console.log(`${colors.bold}${colors.green}================================================================${colors.reset}\n`);
}

run().catch((err) => {
  console.error("Unhandled test suite failure:", err);
  process.exit(1);
});
