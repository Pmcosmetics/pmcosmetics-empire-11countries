import { readFile } from "node:fs/promises";

const read = (file) => readFile(file, "utf8");
const required = [
  "README.md",
  "package.json",
  "config/markets.json",
  "config/catalog.schema.json",
  "server/index.mjs",
  "app/intake/README.md",
  "data/products/README.md",
  "data/images/real/README.md",
  "design-system/astryx/README.md",
];

for (const file of required) await read(file);

const server = await read("server/index.mjs");
const productReadme = await read("data/products/README.md");
const imageReadme = await read("data/images/real/README.md");

if (!server.includes('gate: "CLOSED"')) throw new Error("Active server gate contract is not CLOSED");
if (!server.includes("DATA_INTAKE_LOCKED")) throw new Error("Active products API lock is missing");
if (!server.includes('app.get("/api/products"')) throw new Error("Active products API route is missing");
if (!productReadme.includes("4,363-product")) throw new Error("Product staging guard is missing");
if (!imageReadme.includes("72 real product images")) throw new Error("Image staging guard is missing");

console.log("Validation passed: active server contract, staging paths, Gate CLOSED, and products API lock");
