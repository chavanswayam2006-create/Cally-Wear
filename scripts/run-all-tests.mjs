import http from "http";

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on("error", reject);
  });
}

async function runMasterAudit() {
  console.log("==================================================");
  console.log("    CALLY WEAR QA REMEDIATION VERIFICATION SUITE");
  console.log("==================================================");

  let allPassed = true;
  const check = (desc, condition) => {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
    } else {
      console.error(`  [FAIL] ${desc}`);
      allPassed = false;
    }
  };

  // PHASE 1: Security & Guest Tracking
  console.log("\n--- PHASE 1: P0 Security & Guest Order Tracking ---");
  const accountRes = await fetchPage("/account");
  check("GET /account returns HTTP 200", accountRes.statusCode === 200);
  check("Zero PII in unauthenticated /account HTML", 
    !accountRes.body.includes("Alex Kapoor") && 
    !accountRes.body.includes("alex.streets@gmail.com") && 
    !accountRes.body.includes("98765 43210")
  );
  check("Unauthenticated /account shows Member Sign In prompt", accountRes.body.includes("Account Sign In Required"));

  const trackRes = await fetchPage("/track-order");
  check("Dedicated Guest Tracking portal accessible at /track-order", trackRes.statusCode === 200 && trackRes.body.includes("Track Your Order"));

  // PHASE 2: Catalog & Conversion Paths
  console.log("\n--- PHASE 2: P1 Catalog, Query Parameters & Review Claims ---");
  const shopRes = await fetchPage("/shop");
  check("GET /shop returns full catalog products", shopRes.statusCode === 200 && (shopRes.body.includes("Apex") || shopRes.body.includes("Phantom")));

  const newestRes = await fetchPage("/shop?sort=newest");
  check("GET /shop?sort=newest returns products", newestRes.statusCode === 200 && (newestRes.body.includes("Apex") || newestRes.body.includes("Zenith")));

  const saleRes = await fetchPage("/shop?sale=true");
  check("GET /shop?sale=true returns sale products", saleRes.statusCode === 200 && (saleRes.body.includes("Archive Sale") || saleRes.body.includes("OFF")));

  const pdpRes = await fetchPage("/products/cally-apex-tech-runner");
  check("PDP zero synthetic review claim ('verified reviews' purged)", !pdpRes.body.includes("verified reviews"));
  check("PDP displays authentic batch craft badge", pdpRes.body.includes("Drop 04 Batch") || pdpRes.body.includes("Original Silhouette"));

  // PHASE 3: Functional & Content Consistency
  console.log("\n--- PHASE 3: P2 Content, Accessibility & Legal Compliance ---");
  const shippingRes = await fetchPage("/shipping-returns");
  const faqRes = await fetchPage("/faq");
  const slaMetroText = "Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) are delivered within 2–3 business days";
  
  check("Shipping policy displays unified SLA", shippingRes.body.includes(slaMetroText));
  check("FAQ page displays unified SLA", faqRes.body.includes(slaMetroText));
  check("PDP shipping disclosure displays unified SLA", pdpRes.body.includes(slaMetroText));
  check("PDP accordions carry accessible ARIA attributes", pdpRes.body.includes("aria-expanded") && pdpRes.body.includes("aria-controls"));

  const aboutRes = await fetchPage("/about");
  check("/about links directly to Google Maps", aboutRes.body.includes("maps.google.com/?q=Liberty+Garden"));

  const privacyRes = await fetchPage("/privacy-policy");
  check("Privacy Policy covers DPDP Act 2023 & Grievance Desk", privacyRes.body.includes("DPDP Act 2023") && privacyRes.body.includes("grievance@callywear.com"));

  const termsRes = await fetchPage("/terms");
  check("Terms of Service specifies Mumbai, Maharashtra jurisdiction", termsRes.body.includes("Mumbai, Maharashtra, India"));

  // PHASE 4: Polish & Merchandising
  console.log("\n--- PHASE 4: P3 Polish & Homepage Merchandising ---");
  const homeRes = await fetchPage("/");
  check("Homepage renders with HTTP 200", homeRes.statusCode === 200);
  check("Homepage has distinct 'New Arrivals' and 'Trending' sections", 
    homeRes.body.includes("New Arrivals") && 
    homeRes.body.includes("Trending")
  );

  console.log("\n==================================================");
  console.log(`MASTER AUDIT VERIFICATION: ${allPassed ? "ALL 17 CRITERIA PASSED" : "FAILED"}`);
  console.log("==================================================");

  if (!allPassed) process.exit(1);
}

runMasterAudit().catch((err) => {
  console.error("Master audit run error:", err);
  process.exit(1);
});
