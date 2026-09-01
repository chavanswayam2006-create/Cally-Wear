import http from "http";

http.get("http://localhost:3000/products/cally-apex-tech-runner", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Has Drop 04 Batch:", data.includes("Drop 04 Batch"));
    console.log("Has Metro cities:", data.includes("Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) are delivered within 2–3 business days"));
    console.log("Has aria-expanded:", data.includes("aria-expanded"));
    console.log("Has aria-controls:", data.includes("aria-controls"));
  });
});
