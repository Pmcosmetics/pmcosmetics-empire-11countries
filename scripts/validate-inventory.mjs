import { readFile } from "node:fs/promises";

const markets = JSON.parse(await readFile("config/markets.json", "utf8"));
if (markets.rules?.inventory_requires_validation !== true) throw new Error("Inventory validation gate must be enabled");
const productReadme = await readFile("data/products/README.md", "utf8");
if (!productReadme.includes("4,363-product")) throw new Error("Product staging guard is missing");
console.log("Inventory contract validation passed");
