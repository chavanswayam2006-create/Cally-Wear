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

async function diagnose() {
  const sale = await fetchPage("/shop?sale=true");
  console.log("Has Archive Sale:", sale.body.includes("Archive Sale"));
  console.log("Has Apex:", sale.body.includes("Apex"));
  console.log("Has SAVE:", sale.body.includes("SAVE"));
  console.log("Has Phantom:", sale.body.includes("Phantom"));
}

diagnose();
