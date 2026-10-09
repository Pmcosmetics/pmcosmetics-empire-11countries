const SALLA_API_BASE = "https://api.salla.dev/admin/v2";

const accessToken = () => String(process.env.SALLA_ACCESS_TOKEN || "").trim();

const safeErrorCode = (status) => {
  if (status === 401 || status === 403) return "SALLA_AUTHORIZATION_FAILED";
  if (status === 429) return "SALLA_RATE_LIMITED";
  if (status >= 500) return "SALLA_PROVIDER_ERROR";
  return "SALLA_REQUEST_FAILED";
};

async function sallaRequest(path, { method = "GET", body } = {}) {
  const token = accessToken();
  if (!token) {
    const error = new Error("SALLA_ACCESS_TOKEN is not configured");
    error.code = "SALLA_TOKEN_MISSING";
    throw error;
  }

  const response = await fetch(`${SALLA_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000)
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    const error = new Error(safeErrorCode(response.status));
    error.code = safeErrorCode(response.status);
    error.httpStatus = response.status;
    throw error;
  }

  return payload || {};
}

export function getSallaStatus() {
  const configured = Boolean(accessToken());
  return {
    configured,
    provider: "Salla Merchant API",
    apiBase: SALLA_API_BASE,
    requiredScope: "products.read_write",
    status: configured ? "configured_unverified" : "pending_api_token",
    tokenValueExposed: false,
    importMode: "hidden_draft_only",
    commercialGate: String(process.env.COMMERCIAL_PUBLISH_GATE || "CLOSED").toUpperCase() === "OPEN" ? "OPEN" : "CLOSED"
  };
}

export async function checkSallaConnection() {
  if (!accessToken()) {
    return {
      configured: false,
      reachable: false,
      authenticated: false,
      reason: "SALLA_TOKEN_MISSING",
      storeCurrency: null,
      productCount: null
    };
  }

  try {
    const payload = await sallaRequest("/products?page=1&per_page=1&format=light");
    const products = Array.isArray(payload.data) ? payload.data : [];
    const currency = products
      .map((item) => String(item?.price?.currency || item?.currency || "").trim().toUpperCase())
      .find(Boolean) || null;
    const total = Number(payload.pagination?.total ?? payload.data?.pagination?.total);

    return {
      configured: true,
      reachable: true,
      authenticated: true,
      reason: null,
      storeCurrency: currency,
      productCount: Number.isFinite(total) ? total : null,
      sampledProducts: products.length
    };
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      authenticated: error?.code !== "SALLA_AUTHORIZATION_FAILED",
      reason: error?.code || "SALLA_REQUEST_FAILED",
      storeCurrency: null,
      productCount: null
    };
  }
}

export async function findSallaProductBySku(sku) {
  const normalizedSku = String(sku || "").trim();
  if (!normalizedSku) return null;
  const payload = await sallaRequest(`/products?keyword=${encodeURIComponent(normalizedSku)}&per_page=100&format=light`);
  const products = Array.isArray(payload.data) ? payload.data : [];
  return products.find((item) => String(item?.sku || "").trim() === normalizedSku) || null;
}

export async function createSallaHiddenProduct(product) {
  const sku = String(product?.sku || "").trim();
  const name = String(product?.name || "").trim();
  const imageUrl = String(product?.imageUrl || "").trim();
  const gtin = String(product?.gtin || "").trim();
  const price = Number(product?.retail_price ?? product?.public_price);
  const quantity = Number(product?.stock ?? product?.pm_stock);
  const description = String(product?.description || "").trim();

  if (!sku || !name || !imageUrl || !/^https:\/\//i.test(imageUrl) || !gtin ||
      !Number.isFinite(price) || price <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
    const error = new Error("SALLA_PRODUCT_PAYLOAD_INCOMPLETE");
    error.code = "SALLA_PRODUCT_PAYLOAD_INCOMPLETE";
    throw error;
  }

  return sallaRequest("/products", {
    method: "POST",
    body: {
      name,
      description,
      price,
      status: "hidden",
      product_type: "product",
      quantity,
      sku,
      gtin,
      require_shipping: true,
      images: [{
        original: imageUrl,
        thumbnail: imageUrl,
        alt: name,
        default: true,
        sort: 1
      }]
    }
  });
}
