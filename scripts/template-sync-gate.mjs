const hasText = (value) => typeof value === "string" && value.trim().length > 0;

const asPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

const hasExplicitTargetPrice = (product, currency) => {
  const code = String(currency || "").trim().toUpperCase();
  if (!code) return false;

  const byCurrency = product?.priceByCurrency && typeof product.priceByCurrency === "object"
    ? product.priceByCurrency
    : {};
  const local = product?.priceLocal && typeof product.priceLocal === "object"
    ? product.priceLocal
    : {};

  const candidates = [
    byCurrency[code],
    local[code],
    code === "EGP" ? product?.retail_price : null,
    code === "EGP" ? product?.public_price : null,
    code === "EGP" ? product?.base_price : null
  ];

  return candidates.some(asPositiveNumber);
};

export function evaluateTemplateSyncProduct(product, { targetCurrency } = {}) {
  const reasons = [];
  const currency = String(targetCurrency || "").trim().toUpperCase();

  if (!hasText(product?.sku)) reasons.push("MISSING_SKU");
  if (product?.archived === true || String(product?.status || "").toLowerCase() === "archived") {
    reasons.push("ARCHIVED_PRODUCT");
  }
  if (String(product?.status || "").trim() !== "Publish-Ready") reasons.push("TEMPLATE_NOT_READY");
  if (String(product?.publish_gate || product?.publishGate || "").trim() !== "Publish-Ready") {
    reasons.push("PUBLISH_GATE_NOT_READY");
  }
  if (product?.evidenceVerified !== true || product?.publishable !== true) {
    reasons.push("EVIDENCE_GATE_NOT_VERIFIED");
  }
  if (!hasText(product?.gtin)) reasons.push("MISSING_GTIN");
  if (!hasText(product?.imageUrl)) reasons.push("MISSING_EXACT_IMAGE");
  if (!asPositiveNumber(product?.stock ?? product?.pm_stock)) reasons.push("MISSING_PM_STOCK");
  if (!asPositiveNumber(product?.cost ?? product?.pm_cost_egp)) reasons.push("MISSING_ACQUISITION_COST");

  if (!currency) reasons.push("MISSING_TARGET_CURRENCY");
  else if (!hasExplicitTargetPrice(product, currency)) reasons.push("MISSING_EXPLICIT_TARGET_PRICE");

  return {
    eligible: reasons.length === 0,
    sku: hasText(product?.sku) ? product.sku.trim() : null,
    targetCurrency: currency || null,
    reasons
  };
}

export function evaluateTemplateSyncBatch(products, options = {}) {
  const list = Array.isArray(products) ? products : [];
  const checked = list.map((product) => ({
    product,
    ...evaluateTemplateSyncProduct(product, options)
  }));

  return {
    inputCount: list.length,
    eligibleCount: checked.filter((item) => item.eligible).length,
    blockedCount: checked.filter((item) => !item.eligible).length,
    eligible: checked.filter((item) => item.eligible).map((item) => item.product),
    blocked: checked
      .filter((item) => !item.eligible)
      .map(({ product, sku, targetCurrency, reasons }) => ({
        sku,
        targetCurrency,
        reasons,
        product
      }))
  };
}
