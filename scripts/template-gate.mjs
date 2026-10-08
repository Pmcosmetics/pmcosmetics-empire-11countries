import { readFile } from "node:fs/promises";

const templates = JSON.parse(await readFile("config/template-system.json", "utf8"));
const catalog = JSON.parse(await readFile("config/catalog.schema.json", "utf8"));
const markets = JSON.parse(await readFile("config/markets.json", "utf8"));
const syncGateSource = await readFile("scripts/template-sync-gate.mjs", "utf8");
const serverSource = await readFile("server/index.mjs", "utf8");
const fastSyncSource = await readFile("scripts/fast-product-sync.mjs", "utf8");

const requiredTemplates = [
  "product-evidence",
  "product-master",
  "market",
  "channel-listing",
  "evidence-review",
  "publish",
  "verification",
  "operations-audit"
];

const ids = new Set((templates.templates || []).map((t) => t.id));
for (const id of requiredTemplates) if (!ids.has(id)) throw new Error(`Missing template: ${id}`);

if (templates.gatePolicy?.evidenceFirst !== true) throw new Error("Template gate must be evidence-first");
if (templates.gatePolicy?.publicationRequiresReady !== true) throw new Error("Publication must require READY");
if (templates.gatePolicy?.allowAutoPriceConversion !== false) throw new Error("Automatic price conversion must remain disabled");
if (templates.gatePolicy?.allowPlaceholderData !== false) throw new Error("Placeholder data must remain disabled");
if (templates.gatePolicy?.allowGuessedIdentity !== false) throw new Error("Guessed identity must remain disabled");

if (catalog?.properties?.markets?.items?.enum?.length !== 11) throw new Error("Product Master must target all 11 markets");
if (markets?.markets?.length !== 11) throw new Error("Market template must define exactly 11 markets");
if (markets?.rules?.prices_require_verification !== true) throw new Error("Price verification rule is missing");

if (!syncGateSource.includes("evaluateTemplateSyncBatch")) throw new Error("Template Sync Gate implementation is missing");
if (!serverSource.includes("evaluateTemplateSyncBatch")) throw new Error("API sync is not connected to Template Sync Gate");
if (!fastSyncSource.includes("evaluateTemplateSyncBatch")) throw new Error("Direct sync is not connected to Template Sync Gate");

console.log("Template Gate passed: Product Master -> Evidence Gate -> Sync -> Channels contract is enforced");
