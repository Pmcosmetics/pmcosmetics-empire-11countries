const hasText = (value) => typeof value === "string" && value.trim().length > 0;

const asBool = (value) => value === true || value === "true";

export function evaluateBatchProduct(product) {
  const reasons = [];
  const stock = Number(product?.stock);
  const cost = Number(product?.cost);

  if (!hasText(product?.sku)) reasons.push("MISSING_SKU");
  if (!hasText(product?.name)) reasons.push("MISSING_NAME");
  if (!hasText(product?.gtin)) reasons.push("MISSING_GTIN");
  if (!hasText(product?.imageUrl)) reasons.push("MISSING_EXACT_IMAGE");
  if (!Number.isFinite(stock) || stock <= 0) reasons.push("MISSING_PM_STOCK");
  if (!Number.isFinite(cost) || cost <= 0) reasons.push("MISSING_ACQUISITION_COST");
  if (!asBool(product?.provenanceVerified)) reasons.push("PROVENANCE_NOT_VERIFIED");
  if (!asBool(product?.imageVerified)) reasons.push("IMAGE_NOT_VERIFIED");

  const authorizationRequired = asBool(product?.authorizationRequired);
  if (authorizationRequired && !asBool(product?.authorizationVerified)) {
    reasons.push("AUTHORIZATION_NOT_VERIFIED");
  }

  return {
    eligible: reasons.length === 0,
    sku: hasText(product?.sku) ? product.sku.trim() : null,
    reasons
  };
}

export function evaluateBatch(products) {
  const list = Array.isArray(products) ? products : [];
  const checked = list.map((product) => ({ product, ...evaluateBatchProduct(product) }));

  return {
    inputCount: list.length,
    eligibleCount: checked.filter((item) => item.eligible).length,
    blockedCount: checked.filter((item) => !item.eligible).length,
    eligible: checked.filter((item) => item.eligible).map((item) => item.product),
    blocked: checked.filter((item) => !item.eligible).map(({ product, sku, reasons }) => ({ sku, reasons, product }))
  };
}
