import { readFile } from "node:fs/promises";

const read = (file) => readFile(file, "utf8");
const required = [
  "README.md",
  "package.json",
  "config/markets.json",
  "config/catalog.schema.json",
  "archive/legacy-nextjs-boilerplate/app/page.tsx",
  "archive/legacy-nextjs-boilerplate/app/api/health/route.ts",
  "archive/legacy-nextjs-boilerplate/app/api/products/route.ts",
  "app/intake/README.md",
  "data/products/README.md",
  "data/images/real/README.md",
  "design-system/astryx/README.md",
];

for (const file of required) await read(file);

const health = await read("archive/legacy-nextjs-boilerplate/app/api/health/route.ts");
const products = await read("archive/legacy-nextjs-boilerplate/app/api/products/route.ts");
const productReadme = await read("data/products/README.md");
const imageReadme = await read("data/images/real/README.md");

if (!health.includes('gate: "CLOSED"')) throw new Error("Gate health contract is not CLOSED");
if (!products.includes("DATA_INTAKE_LOCKED")) throw new Error("Products API lock is missing");
if (!productReadme.includes("4,363-product")) throw new Error("Product staging guard is missing");
if (!imageReadme.includes("72 real product images")) throw new Error("Image staging guard is missing");

console.log("Validation passed: archive, staging paths, Gate CLOSED, and products API lock");
