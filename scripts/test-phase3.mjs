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
  console.log("=== PHASE 3 VERIFICATION TEST ===");

  // 1. SLA check
  const shippingRes = await fetchPage("/shipping-returns");
  const faqRes = await fetchPage("/faq");
  const pdpRes = await fetchPage("/products/cally-apex-tech-runner");

  const unifiedPhrase = "Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) are delivered within 2–3 business days. Rest of India arrives within 3–5 business days.";
  const shippingHasSLA = shippingRes.body.includes("Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) are delivered within 2–3 business days");
  const faqHasSLA = faqRes.body.includes("Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) are delivered within 2–3 business days");
  const pdpHasSLA = pdpRes.body.includes("Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) are delivered within 2–3 business days");

  console.log(`- Shipping Page SLA Unified: ${shippingHasSLA ? "PASS" : "FAIL"}`);
  console.log(`- FAQ Page SLA Unified: ${faqHasSLA ? "PASS" : "FAIL"}`);
  console.log(`- PDP Shipping Accordion SLA Unified: ${pdpHasSLA ? "PASS" : "FAIL"}`);

  // 2. Accordions accessibility check
  const hasAriaExpanded = pdpRes.body.includes("aria-expanded") && pdpRes.body.includes("aria-controls");
  console.log(`- PDP Accordions have aria-expanded & aria-controls: ${hasAriaExpanded ? "PASS" : "FAIL"}`);

  // 3. Maps check on /about
  const aboutRes = await fetchPage("/about");
  const hasGoogleMaps = aboutRes.body.includes("maps.google.com/?q=Liberty+Garden+Road+No+3+Malad+West+Mumbai+400064");
  console.log(`- /about links to real Google Maps location: ${hasGoogleMaps ? "PASS" : "FAIL"}`);

  // 4. Privacy policy DPDP check
  const privacyRes = await fetchPage("/privacy-policy");
  const hasDPDP = privacyRes.body.includes("DPDP Act 2023") && privacyRes.body.includes("grievance@callywear.com");
  console.log(`- Privacy policy covers DPDP Act 2023 & Grievance Officer: ${hasDPDP ? "PASS" : "FAIL"}`);

  // 5. Terms of service check
  const termsRes = await fetchPage("/terms");
  const hasTermsLegal = termsRes.body.includes("Mumbai, Maharashtra, India");
  console.log(`- Terms of Service has Indian jurisdiction: ${hasTermsLegal ? "PASS" : "FAIL"}`);

  const pass = shippingHasSLA && faqHasSLA && pdpHasSLA && hasAriaExpanded && hasGoogleMaps && hasDPDP && hasTermsLegal;
  console.log(`\n>>> Phase 3 Overall Result: ${pass ? "PASSED" : "FAILED"} <<<`);
  if (!pass) process.exit(1);
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
