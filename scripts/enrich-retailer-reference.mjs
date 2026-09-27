import { readFile, writeFile } from "node:fs/promises";

const [, , pmPath, referencePath, outputPath] = process.argv;

if (!pmPath || !referencePath || !outputPath) {
  throw new Error(
    "Usage: node scripts/enrich-retailer-reference.mjs <pm.json> <reference.json> <output.json>"
  );
}

const loadJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const pmSource = await loadJson(pmPath);
const referenceSource = await loadJson(referencePath);

if (!Array.isArray(pmSource) || !Array.isArray(referenceSource)) {
  throw new Error("Both input files must contain top-level JSON arrays.");
}

const clean = (value) =>
  String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");


const normalizedSize = (value) => {
  if (!value) return "";
  const raw = clean(value).replace(",", ".");
  const match = raw.match(/(\d+(?:\.\d+)?)\s*(ml|مل|l|ل|liter|litre|لتر|g|جم|gram|جرام|kg|كجم|oz)/i);
  if (!match) return raw;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (["l", "ل", "liter", "litre", "لتر"].includes(unit)) return String(amount * 1000) + "ml";
  if (["kg", "كجم"].includes(unit)) return String(amount * 1000) + "g";
  if (["g", "جم", "gram", "جرام"].includes(unit)) return String(amount) + "g";
  if (unit === "oz") return String(Math.round(amount * 29.5735)) + "ml";
  return String(amount) + "ml";
};

const productName = (record) => record.name ?? record.productName ?? record["Product Name"] ?? "";
const brand = (record) => record.brand ?? record.Brand ?? "";
const size = (record) => record.size ?? record["Size / Variant"] ?? "";
const gtin = (record) => record.gtin ?? record.GTIN ?? record.barcode ?? record["GTIN / Barcode"] ?? "";
const pmSku = (record) => record.pmSku ?? record["PM SKU"] ?? record.sku ?? "";
const sourceSku = (record) => record.sourceSku ?? record.retailerSku ?? record["Retailer SKU"] ?? "";

const refSignature = (record) =>
  [
    clean(brand(record)),
    clean(productName(record)),
    normalizedSize(size(record) || productName(record))
  ].join("|");

const pmSignature = (record) =>
  [
    clean(brand(record)),
    clean(productName(record)),
    normalizedSize(size(record) || productName(record))
  ].join("|");

const byGtin = new Map();
const bySourceSku = new Map();
const bySignature = new Map();

for (const ref of referenceSource) {
  const refGtin = clean(gtin(ref));
  const refSku = clean(sourceSku(ref));
  const sig = refSignature(ref);

  if (refGtin) {
    if (!byGtin.has(refGtin)) byGtin.set(refGtin, []);
    byGtin.get(refGtin).push(ref);
  }
  if (refSku) {
    if (!bySourceSku.has(refSku)) bySourceSku.set(refSku, []);
    bySourceSku.get(refSku).push(ref);
  }
  if (sig !== "||") {
    if (!bySignature.has(sig)) bySignature.set(sig, []);
    bySignature.get(sig).push(ref);
  }
}

const hasExactSingle = (map, key) => {
  const hits = map.get(key) ?? [];
  return hits.length === 1 ? hits[0] : null;
};

const matchRecord = (pm) => {
  const pmGtin = clean(gtin(pm));
  const pmSourceSku = clean(sourceSku(pm));
  const sig = pmSignature(pm);

  if (pmGtin) {
    const hit = hasExactSingle(byGtin, pmGtin);
    if (hit) return { match: hit, type: "exact_gtin", confidence: 1 };
  }

  if (pmSourceSku) {
    const hit = hasExactSingle(bySourceSku, pmSourceSku);
    if (hit) return { match: hit, type: "exact_source_sku", confidence: 0.99 };
  }

  const sigHit = hasExactSingle(bySignature, sig);
  if (sigHit) return { match: sigHit, type: "exact_brand_name_size", confidence: 0.97 };

  const candidates = referenceSource.filter((ref) => {
    const sameBrand = clean(brand(pm)) && clean(brand(pm)) === clean(brand(ref));
    const sameSize = normalizedSize(size(pm) || productName(pm)) === normalizedSize(size(ref) || productName(ref));
    return sameBrand && sameSize;
  });

  if (candidates.length === 1) {
    return { match: candidates[0], type: "review_brand_name_size_candidate", confidence: 0.9 };
  }

  return {
    match: null,
    type: candidates.length > 1 ? "ambiguous" : "none",
    confidence: 0,
    candidates: candidates.length
  };
};

const enrichGate = (pm, matched) => {
  const identityReady =
    Boolean(pmSku(pm)) &&
    Boolean(gtin(pm)) &&
    matched &&
    Boolean(matched.source?.url ?? matched.url);

  const costValue = pm.costEgp ?? pm.cost;
  const evidenceReady =
    identityReady &&
    Boolean(pm.pmStockEvidence ?? pm.stockEvidence) &&
    costValue !== undefined &&
    costValue !== null &&
    costValue !== "" &&
    Number.isFinite(Number(costValue)) &&
    Boolean(pm.imageEvidence) &&
    Boolean(pm.evidenceValidated);

  if (!matched) return "Blocked — Identity";
  return evidenceReady ? "Publish-Ready" : "Blocked — Image/Stock";
};

const rows = pmSource.map((pm) => {
  const result = matchRecord(pm);

  return {
    ...pm,
    enrichment: result.match
      ? {
          source: result.match.source ?? "retailer_reference",
          matchType: result.type,
          confidence: result.confidence,
          gtinReference: gtin(result.match) || null,
          retailerSkuReference: sourceSku(result.match) || null,
          publicPriceEgp: result.match.publicPriceEgp ?? result.match["Public Price EGP"] ?? null,
          descriptionReference: result.match.descriptionAr ?? result.match.description ?? null,
          imageReference: result.match.imageUrl ?? null,
          sourceUrl: result.match.url ?? result.match.sourceUrl ?? null,
          availabilityReference: result.match.availability ?? null,
          pmStockProof: Boolean(pm.pmStockEvidence ?? pm.stockEvidence),
          pmImageProof: Boolean(pm.imageEvidence)
        }
      : {
          matchType: result.type,
          confidence: result.confidence,
          candidateCount: result.candidates ?? 0
        },
    publishGate: enrichGate(pm, result.match)
  };
});

const summary = {
  generatedAt: new Date().toISOString(),
  pmRecords: rows.length,
  referenceRecords: referenceSource.length,
  matched: rows.filter((row) => row.enrichment?.matchType?.startsWith("exact_")).length,
  reviewCandidates: rows.filter((row) => row.enrichment?.matchType === "review_brand_name_size_candidate").length,
  ambiguous: rows.filter((row) => row.enrichment?.matchType === "ambiguous").length,
  unmatched: rows.filter((row) => row.enrichment?.matchType === "none").length,
  publishReady: rows.filter((row) => row.publishGate === "Publish-Ready").length,
  publicationPolicy: "Reference enrichment never proves PM stock, cost, supplier, batch/expiry, or ownership."
};

await writeFile(
  outputPath,
  JSON.stringify({ summary, products: rows }, null, 2) + "\n",
  "utf8"
);

console.log(JSON.stringify(summary, null, 2));
