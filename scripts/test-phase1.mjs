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
  console.log("=== PHASE 1 VERIFICATION TEST ===");

  const accountRes = await fetchPage("/account");
  console.log(`GET /account -> HTTP ${accountRes.statusCode}`);

  const hasAlex = accountRes.body.includes("Alex Kapoor");
  const hasEmail = accountRes.body.includes("alex.streets@gmail.com");
  const hasPhone = accountRes.body.includes("98765 43210");
  const hasSignInPrompt = accountRes.body.includes("Account Sign In Required");
  const hasTrackGuestPrompt = accountRes.body.includes("Track with Order Number");

  console.log(`- Hardcoded Name 'Alex Kapoor' in SSR HTML: ${hasAlex ? "FAIL (Leaked)" : "PASS (Zero PII)"}`);
  console.log(`- Hardcoded Email in SSR HTML: ${hasEmail ? "FAIL (Leaked)" : "PASS (Zero PII)"}`);
  console.log(`- Hardcoded Phone in SSR HTML: ${hasPhone ? "FAIL (Leaked)" : "PASS (Zero PII)"}`);
  console.log(`- Logged-out Sign In Prompt displayed: ${hasSignInPrompt ? "PASS" : "FAIL"}`);
  console.log(`- Guest Track Order Link displayed: ${hasTrackGuestPrompt ? "PASS" : "FAIL"}`);

  const trackRes = await fetchPage("/track-order");
  console.log(`\nGET /track-order -> HTTP ${trackRes.statusCode}`);
  const hasTrackHeader = trackRes.body.includes("Track Your Order");
  console.log(`- Dedicated Guest Tracking Portal Accessible: ${hasTrackHeader ? "PASS" : "FAIL"}`);

  const pass = !hasAlex && !hasEmail && !hasPhone && hasSignInPrompt && hasTrackHeader;
  console.log(`\n>>> Phase 1 Overall Result: ${pass ? "PASSED" : "FAILED"} <<<`);
  if (!pass) process.exit(1);
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
