import http from "http";

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
    }).on("error", reject);
  });
}

async function run() {
  console.log("=== PHASE 2 VERIFICATION TEST ===");

  // Test /shop
  const shopRes = await fetchPage("/shop");
  console.log(`GET /shop -> HTTP ${shopRes.statusCode}`);
  const hasProducts = shopRes.body.includes("Apex Tech Runner") || shopRes.body.includes("Phantom Retro Low");
  console.log(`- /shop contains catalog products: ${hasProducts ? "PASS" : "FAIL"}`);

  // Test /shop?sort=newest
  const newestRes = await fetchPage("/shop?sort=newest");
  console.log(`GET /shop?sort=newest -> HTTP ${newestRes.statusCode}`);
  const hasNewestProducts = newestRes.body.includes("Apex Tech Runner") || newestRes.body.includes("Zenith Carbon Racer");
  console.log(`- /shop?sort=newest returns product set: ${hasNewestProducts ? "PASS" : "FAIL"}`);

  // Test /shop?sale=true
  const saleRes = await fetchPage("/shop?sale=true");
  console.log(`GET /shop?sale=true -> HTTP ${saleRes.statusCode}`);
  const hasSaleProducts = saleRes.body.includes("SAVE") || saleRes.body.includes("Apex") || saleRes.body.includes("Nomad");
  console.log(`- /shop?sale=true returns sale product set: ${hasSaleProducts ? "PASS" : "FAIL"}`);

  // Test no synthetic review claims
  const pdpRes = await fetchPage("/products/cally-apex-tech-runner");
  console.log(`GET /products/cally-apex-tech-runner -> HTTP ${pdpRes.statusCode}`);
  const hasFakeReview = pdpRes.body.includes("verified reviews");
  console.log(`- PDP zero synthetic review claim: ${!hasFakeReview ? "PASS" : "FAIL (Found fake review claim)"}`);

  const pass = hasProducts && hasNewestProducts && hasSaleProducts && !hasFakeReview;
  console.log(`\n>>> Phase 2 Overall Result: ${pass ? "PASSED" : "FAILED"} <<<`);
  if (!pass) process.exit(1);
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
