import { readFile } from "node:fs/promises";

const read = (file) => readFile(file, "utf8");
const required = [
  "README.md",
  "package.json",
  "config/markets.json",
  "config/catalog.schema.json",
  "server/index.mjs",
  "scripts/batch-gate.mjs",
  "app/intake/README.md",
  "data/products/README.md",
  "data/images/real/README.md",
  "design-system/astryx/README.md",
];

for (const file of required) await read(file);

const server = await read("server/index.mjs");
const productReadme = await read("data/products/README.md");
const imageReadme = await read("data/images/real/README.md");
const serverContract = await read("scripts/batch-gate.mjs");

if (!server.includes("COMMERCIAL_PUBLISH_GATE")) throw new Error("Commercial gate environment contract is missing");
if (!server.includes('process.env.COMMERCIAL_PUBLISH_GATE || "CLOSED"')) throw new Error("Commercial gate default CLOSED contract is missing");
if (!server.includes('toUpperCase() === "OPEN" ? "OPEN" : "CLOSED"')) throw new Error("Commercial gate normalization contract is missing");
if (!server.includes("DATA_INTAKE_LOCKED")) throw new Error("Active products API lock is missing");
if (!server.includes('app.get("/api/products"')) throw new Error("Active products API route is missing");
if (!productReadme.includes("verified PM Cosmetics product source")) throw new Error("Product source staging contract is missing");
if (!productReadme.includes("Staging evidence alone does not open the commercial publication gate")) throw new Error("Product staging evidence-gate rule is missing");
if (!imageReadme.includes("verified PM-owned real product images")) throw new Error("Real image staging contract is missing");
if (!imageReadme.includes("Do not add placeholders")) throw new Error("Real image anti-placeholder guard is missing");
if (!serverContract.includes("PROVENANCE_NOT_VERIFIED")) throw new Error("Batch provenance guard is missing");
if (!server.includes("/api/products/batch/readiness")) throw new Error("Batch readiness route is missing");
if (!server.includes("/api/products/batch/publish")) throw new Error("Batch publish route is missing");
if (!server.includes("BATCH_COMMERCIAL_PUBLISH_GATE")) throw new Error("Batch commercial gate contract is missing");
if (!server.includes('app.get("/api/whatsapp/status"')) throw new Error("WhatsApp status route is missing");
if (!server.includes('app.get("/api/whatsapp/webhook"')) throw new Error("WhatsApp webhook verification route is missing");
if (!server.includes('x-hub-signature-256')) throw new Error("WhatsApp webhook signature guard is missing");
if (!server.includes('app.post("/api/shopify/webhook"')) throw new Error("Shopify webhook route is missing");
if (!server.includes('x-shopify-hmac-sha256')) throw new Error("Shopify webhook HMAC guard is missing");

console.log("Validation passed: dynamic commercial gate contract, staging provenance rules, Gate CLOSED default, and products API lock");
