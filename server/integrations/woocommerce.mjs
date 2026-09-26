const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_PAGE_SIZE = 100;

function getWooConfig() {
  const baseUrl = String(process.env.WOOCOMMERCE_URL || "").trim().replace(/\/+$/, "");
  const consumerKey = String(process.env.WOOCOMMERCE_CONSUMER_KEY || "").trim();
  const consumerSecret = String(process.env.WOOCOMMERCE_CONSUMER_SECRET || "").trim();
  const enabled = String(process.env.WOOCOMMERCE_SYNC_ENABLED || "").toLowerCase() === "true";
  const batchSize = Math.min(
    100,
    Math.max(1, Number(process.env.WOOCOMMERCE_BATCH_SIZE || DEFAULT_BATCH_SIZE))
  );

  return {
    baseUrl,
    consumerKey,
    consumerSecret,
    enabled,
    batchSize
  };
}

function assertValidBaseUrl(baseUrl) {
  if (!baseUrl) throw new Error("WOOCOMMERCE_URL is not configured");
  const url = new URL(baseUrl);
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error("WOOCOMMERCE_URL must use HTTPS");
  }
}

export function getWooStatus() {
  const config = getWooConfig();
  let urlOk = false;

  if (config.baseUrl) {
    try {
      assertValidBaseUrl(config.baseUrl);
      urlOk = true;
    } catch {
      urlOk = false;
    }
  }

  return {
    configured: Boolean(config.baseUrl && config.consumerKey && config.consumerSecret && urlOk),
    enabled: config.enabled,
    batchSize: config.batchSize,
    api: config.baseUrl ? `${config.baseUrl}/wp-json/wc/v3` : null
  };
}

function authHeader(consumerKey, consumerSecret) {
  return `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`;
}

async function wooRequest(path, { method = "GET", body, signal } = {}) {
  const config = getWooConfig();
  assertValidBaseUrl(config.baseUrl);

  if (!config.consumerKey || !config.consumerSecret) {
    throw new Error("WooCommerce API credentials are not configured");
  }

  const response = await fetch(`${config.baseUrl}/wp-json/wc/v3${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader(config.consumerKey, config.consumerSecret)
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    const message = payload?.message || payload?.code || `WooCommerce request failed with HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return { payload, headers: response.headers };
}

async function listAllProducts() {
  const existing = [];
  let page = 1;

  while (true) {
    const { payload, headers } = await wooRequest(
      `/products?per_page=${DEFAULT_PAGE_SIZE}&page=${page}&orderby=id&order=asc`
    );
    if (!Array.isArray(payload) || payload.length === 0) break;

    existing.push(...payload);
    const totalPages = Number(headers.get("x-wp-totalpages") || page);
    if (page >= totalPages) break;
    page += 1;
  }

  return existing;
}

function normalizeProduct(input) {
  const source = input && typeof input === "object" ? input : {};
  const sku = String(source.sku ?? source.SKU ?? "").trim();
  const name = String(source.name ?? source.product ?? source.title ?? "").trim();
  const price = source.regular_price ?? source.price ?? source.retail_price ?? source.public_price;

  if (!sku || !name) return null;

  const item = {
    name,
    sku,
    type: source.type || "simple",
    status: source.status || "draft"
  };

  if (price !== undefined && price !== null && String(price).trim() !== "") {
    item.regular_price = String(price);
  }

  const stock = source.stock_quantity ?? source.stock ?? source.pm_stock;
  if (stock !== undefined && stock !== null && String(stock).trim() !== "") {
    const stockQuantity = Number(stock);
    if (Number.isFinite(stockQuantity)) {
      item.manage_stock = true;
      item.stock_quantity = Math.max(0, Math.floor(stockQuantity));
      item.stock_status = stockQuantity > 0 ? "instock" : "outofstock";
    }
  }

  const description = source.description ?? source.long_description;
  const shortDescription = source.short_description ?? source.shortDescription;
  if (description) item.description = String(description);
  if (shortDescription) item.short_description = String(shortDescription);

  const images = Array.isArray(source.images)
    ? source.images
        .map((image) => typeof image === "string" ? image : image?.src)
        .filter(Boolean)
        .map((src) => ({ src }))
    : [];

  if (images.length > 0) item.images = images;

  if (source.category) {
    const categories = Array.isArray(source.category) ? source.category : [source.category];
    item.categories = categories
      .map((category) => typeof category === "string" ? category : category?.name)
      .filter(Boolean)
      .map((name) => ({ name: String(name) }));
  }

  return item;
}

function chunk(items, size) {
  const output = [];
  for (let i = 0; i < items.length; i += size) {
    output.push(items.slice(i, i + size));
  }
  return output;
}

export async function syncWooProducts(products, { dryRun = true } = {}) {
  if (!Array.isArray(products)) throw new Error("products must be an array");

  const normalized = products.map(normalizeProduct).filter(Boolean);
  const skipped = products.length - normalized.length;

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      sourceCount: products.length,
      validCount: normalized.length,
      skippedCount: skipped,
      createCount: normalized.length,
      updateCount: 0,
      batches: 0
    };
  }

  const config = getWooConfig();
  if (!config.enabled) throw new Error("WOOCOMMERCE_SYNC_ENABLED is not true");

  const existing = await listAllProducts();
  const existingBySku = new Map(
    existing
      .filter((item) => item?.sku)
      .map((item) => [String(item.sku).trim(), item])
  );

  const creates = [];
  const updates = [];

  for (const item of normalized) {
    const current = existingBySku.get(item.sku);
    if (current?.id) {
      updates.push({ id: current.id, ...item });
    } else {
      creates.push(item);
    }
  }

  let createResults = 0;
  let updateResults = 0;
  const totalBatches = Math.ceil(creates.length / config.batchSize) + Math.ceil(updates.length / config.batchSize);

  for (const batch of chunk(creates, config.batchSize)) {
    const { payload } = await wooRequest("/products/batch", {
      method: "POST",
      body: { create: batch }
    });
    createResults += Array.isArray(payload?.create) ? payload.create.length : batch.length;
  }

  for (const batch of chunk(updates, config.batchSize)) {
    const { payload } = await wooRequest("/products/batch", {
      method: "POST",
      body: { update: batch }
    });
    updateResults += Array.isArray(payload?.update) ? payload.update.length : batch.length;
  }

  return {
    ok: true,
    dryRun: false,
    sourceCount: products.length,
    validCount: normalized.length,
    skippedCount: skipped,
    createCount: createResults,
    updateCount: updateResults,
    batches: totalBatches
  };
}
