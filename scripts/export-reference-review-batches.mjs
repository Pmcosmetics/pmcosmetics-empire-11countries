import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "data/references/alfouad-cosmetics-catalog");
const outputRoot = path.resolve(process.argv[2] ?? "dist/reference-review-batches");
const batchSize = 250;
const expectedCategoryRows = 3479;
const expectedUniqueProducts = 3218;

const categorySpecs = [
  { file: "skin-care.json", label: "العناية بالبشرة", expectedRows: 1178 },
  { file: "hair-care.json", label: "العناية بالشعر", expectedRows: 992 },
  { file: "body-care.json", label: "العناية بالجسم", expectedRows: 921 },
  { file: "perfumes.json", label: "العطور", expectedRows: 178 },
  { file: "kids-care.json", label: "عناية الأطفال التجميلية", expectedRows: 157 },
  { file: "korean.json", label: "الجمال الكوري", expectedRows: 53 }
];

const readJson = async (file) =>
  JSON.parse(await readFile(file, "utf8"));

const csvCell = (value) => {
  if (value === null || value === undefined) return "";
  const stringValue =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
};

const headers = [
  "reference_record_id",
  "source_handle",
  "name",
  "brand",
  "category",
  "category_labels",
  "product_type",
  "source_sku",
  "reference_price_egp",
  "compare_at_price_egp",
  "source_available",
  "reference_image_url",
  "reference_description",
  "source_url",
  "source_name",
  "reference_only",
  "image_rights_status",
  "pm_identity_verified",
  "pm_stock_verified",
  "pm_cost_verified",
  "pm_image_rights_verified",
  "scope_review_required",
  "publish_status"
];

const csvRow = (product) => {
  const values = [
    product.sourceId,
    product.handle,
    product.name,
    product.brand,
    product.category,
    product.categoryLabels,
    product.productType,
    product.sku,
    product.priceEGP,
    product.compareAtPriceEGP,
    product.available,
    product.imageUrl,
    product.description,
    product.sourceUrl,
    product.source,
    true,
    product.imageRights || "Verify usage rights before commercial publication",
    false,
    false,
    false,
    false,
    true,
    "HOLD — REFERENCE ONLY"
  ];
  return values.map(csvCell).join(",");
};

const sourceIndex = await readJson(path.join(sourceRoot, "index.json"));
if (sourceIndex.summary?.referenceOnly !== true) {
  throw new Error("Reference index must explicitly remain referenceOnly=true.");
}

const sourceRows = [];
const categoryAudit = [];
for (const spec of categorySpecs) {
  const filePath = path.join(sourceRoot, "categories", spec.file);
  const categoryData = await readJson(filePath);
  if (!Array.isArray(categoryData.products)) {
    throw new Error(`Missing products array in ${spec.file}`);
  }
  if (categoryData.referenceOnly !== true) {
    throw new Error(`Category is not marked referenceOnly=true: ${spec.file}`);
  }

  const countMatches =
    categoryData.products.length === categoryData.count &&
    categoryData.products.length === spec.expectedRows;
  categoryAudit.push({
    file: spec.file,
    label: spec.label,
    expectedRows: spec.expectedRows,
    declaredCount: categoryData.count ?? null,
    actualRows: categoryData.products.length,
    countMatches,
    sourceUrl: categoryData.sourceUrl ?? null
  });

  for (const row of categoryData.products) {
    sourceRows.push({
      ...row,
      category: row.category || spec.label,
      categoryLabels: [spec.label],
      sourceCategoryFile: spec.file,
      referenceOnly: true
    });
  }
}

const identityKey = (row) => {
  if (row.sourceId !== undefined && row.sourceId !== null && String(row.sourceId)) {
    return `sourceId:${String(row.sourceId)}`;
  }
  if (row.handle) return `handle:${String(row.handle).toLowerCase()}`;
  if (row.sourceUrl) return `url:${String(row.sourceUrl).toLowerCase()}`;
  return [
    row.brand ?? "",
    row.name ?? "",
    row.category ?? ""
  ].join("|").toLowerCase();
};

const uniqueMap = new Map();
let duplicateRows = 0;
for (const row of sourceRows) {
  const key = identityKey(row);
  const prior = uniqueMap.get(key);
  if (!prior) {
    uniqueMap.set(key, { ...row });
    continue;
  }
  duplicateRows += 1;
  const labels = new Set([
    ...(Array.isArray(prior.categoryLabels) ? prior.categoryLabels : []),
    ...(Array.isArray(row.categoryLabels) ? row.categoryLabels : [])
  ]);
  prior.categoryLabels = [...labels];
}
const products = [...uniqueMap.values()];

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const missing = {
  sku: 0,
  price: 0,
  image: 0,
  description: 0,
  sourceUrl: 0,
  name: 0,
  brand: 0
};
for (const p of products) {
  if (!p.sku) missing.sku += 1;
  if (p.priceEGP === null || p.priceEGP === undefined || p.priceEGP === "") missing.price += 1;
  if (!p.imageUrl) missing.image += 1;
  if (!p.description) missing.description += 1;
  if (!p.sourceUrl) missing.sourceUrl += 1;
  if (!p.name) missing.name += 1;
  if (!p.brand) missing.brand += 1;
}

const batchFiles = [];
for (let offset = 0; offset < products.length; offset += batchSize) {
  const number = String(Math.floor(offset / batchSize) + 1).padStart(3, "0");
  const batch = products.slice(offset, offset + batchSize);
  const fileName = `pm-reference-batch-${number}.csv`;
  const csv = [headers.join(","), ...batch.map(csvRow)].join("\n") + "\n";
  await writeFile(path.join(outputRoot, fileName), csv, "utf8");
  batchFiles.push({
    file: fileName,
    rows: batch.length,
    sizeBytes: Buffer.byteLength(csv, "utf8")
  });
}

const duplicateSummary = {
  categoryRows: sourceRows.length,
  duplicateRows,
  uniqueRows: products.length,
  expectedCategoryRows,
  expectedUniqueProducts,
  categoryRowsMatchExpected: sourceRows.length === expectedCategoryRows,
  uniqueRowsMatchExpected: products.length === expectedUniqueProducts
};

const summary = {
  generatedAt: new Date().toISOString(),
  brand: "PM COSMETICS HUB",
  source: "AlFouad Pharmacies reference catalog snapshot already stored in this repository",
  status: "REFERENCE_ONLY — NOT A PM STOCK OR PUBLISH-READY CATALOG",
  categoryAudit,
  ...duplicateSummary,
  batchSize,
  batchFiles,
  fieldCompleteness: {
    totalUniqueProducts: products.length,
    missingFields: missing,
    allRowsMarkedReferenceOnly: products.every((p) => p.referenceOnly === true),
    allRowsHaveCommercialHold: true,
    publishableNow: 0
  },
  safeguards: [
    "Source price is reference retail price, not PM-approved selling price.",
    "Source availability is not PM inventory.",
    "Reference product data is not proof of PM ownership or acquisition cost.",
    "Product imagery is not cleared for reuse; image rights must be verified.",
    "Scope review is required, especially for non-cosmetic or regulated items.",
    "No marketplace listings are created or published by this export."
  ]
};

await writeFile(
  path.join(outputRoot, "summary.json"),
  JSON.stringify(summary, null, 2) + "\n",
  "utf8"
);

const readme = [
  "# PM COSMETICS HUB — Reference Review Batches",
  "",
  `Generated: ${summary.generatedAt}`,
  "",
  `- Category rows: ${sourceRows.length} (expected ${expectedCategoryRows})`,
  `- Unique records: ${products.length} (expected ${expectedUniqueProducts})`,
  `- Duplicate rows removed across categories: ${duplicateRows}`,
  `- CSV batches: ${batchFiles.length}`,
  `- Batch size: up to ${batchSize} records`,
  "",
  "This artifact contains third-party reference data only. It is not the PM Product Master.",
  "Every row is marked HOLD — REFERENCE ONLY; PM identity, stock, cost, and image rights remain unverified.",
  "Do not import these files directly into a live sales channel or activate listings.",
  "",
  "See summary.json for category row counts, expected-count comparison, missing fields and safeguards.",
  ""
].join("\n");
await writeFile(path.join(outputRoot, "README.md"), readme, "utf8");

console.log(JSON.stringify({
  outputRoot,
  ...duplicateSummary,
  batches: batchFiles.length,
  fieldCompleteness: summary.fieldCompleteness,
  missingFields: missing,
  categoryAudit
}, null, 2));
