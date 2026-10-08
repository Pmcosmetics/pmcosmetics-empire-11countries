import express from "express";
import helmet from "helmet";
import { rateLimit as createRateLimit } from "express-rate-limit";
import cors from "cors";
import { createRequire } from "node:module";
import { createHmac, timingSafeEqual } from "node:crypto";
import { checkWooConnection, getWooStatus, syncWooProducts } from "./integrations/woocommerce.mjs";
import { getManusStatus, pullManusProducts, validateManusProducts } from "./integrations/manus.mjs";
import { getActiveProductsBySkus, isSupabaseConfigured, listActiveProducts } from "./integrations/supabase.mjs";
import { evaluateBatch } from "../scripts/batch-gate.mjs";
import { evaluateTemplateSyncBatch } from "../scripts/template-sync-gate.mjs";
import { getAmplitudeStatus, trackAmplitudeEvent } from "./integrations/amplitude.mjs";
import { authConfigSnapshot, bearerTokenFromRequest, verifyAccessToken } from "./integrations/auth.mjs";

const require = createRequire(import.meta.url);
const marketConfig = require("../config/markets.json");
const storefrontConfig = require("../config/storefront-cosmetics.json");
const brandConfig = require("../config/brand-identity.json");
const referenceCatalogConfig = require("../config/reference-catalog.json");
const evidenceSnapshot = require("../data/products/staging-evidence.json");
const authIdentityConfig = require("../config/auth-identity.json");
const empireRegistry = require("../config/empire-unified-registry.json");

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "25mb", verify: (req, _res, buf) => { req.rawBody = Buffer.from(buf); } }));

const HTTPS_ONLY = String(process.env.HTTPS_ONLY || "true").toLowerCase() === "true";
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 60);

const rateLimit = createRateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: "draft-8",
  legacyHeaders: true,
  handler: (_req, res) => res.status(429).json({
    ok: false,
    reason: "RATE_LIMITED"
  })
});

app.use((req, res, next) => {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim().toLowerCase();
  if (HTTPS_ONLY && forwardedProto === "http") {
    return res.redirect(308, "https://" + req.get("host") + req.originalUrl);
  }
  return next();
});

app.use(express.static("public", { index: false }));

const gateState = () => String(process.env.COMMERCIAL_PUBLISH_GATE || "CLOSED").toUpperCase() === "OPEN" ? "OPEN" : "CLOSED";
const authoritativePublishReadyBySku = new Map(
  (Array.isArray(evidenceSnapshot.products) ? evidenceSnapshot.products : [])
    .filter((product) =>
      product?.sku &&
      product?.status === "Publish-Ready" &&
      product?.publish_gate === "Publish-Ready"
    )
    .map((product) => [String(product.sku).trim(), product])
);

const productEvidenceGateState = () => {
  const configured = String(process.env.PRODUCT_EVIDENCE_GATE || "").toUpperCase();
  return configured === "OPEN" && authoritativePublishReadyBySku.size > 0 ? "OPEN" : "CLOSED";
};

const commercialCatalogLiveState = () => String(process.env.COMMERCIAL_CATALOG_LIVE || "").toLowerCase() === "true";

const reconcileBatchProducts = async (products) => {
  const list = Array.isArray(products) ? products : [];
  const skus = list
    .map((product) => String(product?.sku ?? product?.SKU ?? "").trim())
    .filter(Boolean);

  const activeProducts = await getActiveProductsBySkus(skus);
  const activeBySku = new Map(
    (Array.isArray(activeProducts) ? activeProducts : [])
      .map((product) => [String(product?.sku || "").trim(), product])
  );

  return list.map((input) => {
    const sku = String(input?.sku ?? input?.SKU ?? "").trim();
    const evidence = authoritativePublishReadyBySku.get(sku);
    const catalog = activeBySku.get(sku);
    const authorizationStatus = String(evidence?.authorization_status || "");
    const authorizationRequired = authorizationStatus.includes("Required");
    const authorizationVerified = authorizationStatus === "Verified";
    const imageUrl = String(catalog?.image_url || "").trim();

    const authoritativeReady = Boolean(
      evidence &&
      catalog &&
      Number(evidence.pm_stock) > 0 &&
      Number(evidence.pm_cost_egp) > 0 &&
      String(evidence.gtin?.text || evidence.gtin || "").trim() &&
      String(evidence.image_evidence_url || "").trim() &&
      imageUrl &&
      String(evidence.source_type || "").trim() &&
      evidence.source_type !== "Unresolved" &&
      (!authorizationRequired || authorizationVerified)
    );

    return {
      ...input,
      sku,
      name: String(catalog?.name || evidence?.name || input?.name || "").trim(),
      gtin: String(evidence?.gtin?.text || evidence?.gtin || input?.gtin || "").trim(),
      stock: authoritativeReady ? Number(evidence.pm_stock) : 0,
      pm_stock: authoritativeReady ? Number(evidence.pm_stock) : 0,
      cost: authoritativeReady ? Number(evidence.pm_cost_egp) : 0,
      imageUrl: authoritativeReady ? imageUrl : "",
      public_price: authoritativeReady ? String(catalog.base_price) : "",
      retail_price: authoritativeReady ? String(catalog.base_price) : "",
      provenanceVerified: authoritativeReady,
      imageVerified: authoritativeReady,
      authorizationRequired,
      authorizationVerified,
      publishable: authoritativeReady,
      evidenceVerified: authoritativeReady,
      status: String(evidence?.status || "").trim(),
      publish_gate: String(evidence?.publish_gate || "").trim(),
      archived: String(evidence?.status || "").trim().toLowerCase() === "archived"
    };
  });
};

const batchGateState = () => {
  const configured = process.env.BATCH_COMMERCIAL_PUBLISH_GATE;
  if (configured !== undefined && configured !== "") {
    return String(configured).toUpperCase() === "OPEN" ? "OPEN" : "CLOSED";
  }
  return "CLOSED";
};

const locked = (service, reason = "DATA_INTAKE_LOCKED") => ({
  ok: false, service, status: 503, gate: gateState(), reason
});

const requireEmpireAuth = async (req, res, next) => {
  const result = await verifyAccessToken(bearerTokenFromRequest(req));
  if (!result.ok) {
    return res.status(result.status || 401).json({
      ok: false,
      authenticated: false,
      reason: result.reason || "AUTH_REQUIRED"
    });
  }
  req.empireAuth = result;
  return next();
};

const healthResponse = (_req, res) => res.json({
  ok: true,
  service: "pmcosmetics-empire-11countries",
  gate: gateState(),
  productEvidenceGate: productEvidenceGateState(),
  commercialCatalogLive: commercialCatalogLiveState(),
  runtime: "Vercel/Railway",
  dataSource: isSupabaseConfigured() ? "Supabase" : "Airtable",
  supabaseConfigured: isSupabaseConfigured(),
  architecture: ["ChatGPT","Products OS","Airtable","Supabase","Vercel","Railway","Manus","WooCommerce","Shopify","Noon","Amazon","Jumia"]
});

app.get("/", (_req, res) => res.sendFile("public/index.html", { root: process.cwd() }));

app.get("/auth", (_req, res) => res.sendFile("auth.html", { root: "public" }));
app.use("/api/auth", rateLimit);

app.get("/api/auth/config", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  return res.json({
    ok: true,
    ...authConfigSnapshot(),
    primaryEmail: authIdentityConfig.primaryEmail,
    secondaryEmail: authIdentityConfig.secondaryEmail,
    supabaseUrl: process.env.SUPABASE_URL || authIdentityConfig.supabaseUrl,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || "",
  });
});

app.get("/api/auth/session", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const result = await verifyAccessToken(bearerTokenFromRequest(req));
  if (!result.ok) {
    return res.status(result.status || 401).json({
      ok: false,
      authenticated: false,
      reason: result.reason,
    });
  }
  return res.json({
    ok: true,
    authenticated: true,
    user: {
      id: result.user.id,
      email: result.email,
      role: result.user.role || null,
      lastSignInAt: result.user.last_sign_in_at || null,
    },
  });
});



app.get("/api/empire/registry", rateLimit, requireEmpireAuth, (_req, res) => res.json({
  ok: true,
  registry: empireRegistry,
  runtime: {
    commercialGate: gateState(),
    referenceOnly: empireRegistry.catalog.reference.referenceOnly,
    publishReadyProducts: empireRegistry.catalog.commercial.currentPublishReadyProducts
  }
}));

app.get("/api/storefront", (_req, res) => res.json({
  ok: true,
  brand: brandConfig.brandName,
  tagline: storefrontConfig.tagline,
  logo: brandConfig.logo,
  contact: brandConfig.contact,
  scope: storefrontConfig.scope,
  categories: storefrontConfig.categories,
  concerns: storefrontConfig.concerns,
  brands: storefrontConfig.brands,
  policy: storefrontConfig.policy,
  gate: gateState()
}));

app.get("/api/storefront/search", async (req, res) => {
  const query = String(req.query.q || "").trim().toLowerCase();
  if (!query) return res.json({ ok: true, gate: gateState(), products: [] });
  try {
    const products = await listActiveProducts();
    const rows = Array.isArray(products) ? products : [];
    const matched = rows.filter((p) => JSON.stringify(p).toLowerCase().includes(query));
    return res.json({ ok: true, gate: gateState(), products: matched, count: matched.length });
  } catch (error) {
    return res.status(503).json({ ok: false, gate: gateState(), reason: "STOREFRONT_SEARCH_UNAVAILABLE", message: error instanceof Error ? error.message : "Unknown error" });
  }
});


app.get("/api/brand", (_req, res) => res.json({
  ok: true,
  brandName: brandConfig.brandName,
  logo: brandConfig.logo,
  phones: brandConfig.phones,
  whatsappCatalog: brandConfig.whatsappCatalog,
  policy: brandConfig.policy
}));


const REFERENCE_RAW_BASE = "https://raw.githubusercontent.com/Pmcosmetics/pmcosmetics-empire-11countries/ref/alfouad-cosmetics-catalog-2026-10-02/data/references/alfouad-cosmetics-catalog/categories";
const referenceCache = new Map();

app.get("/reference-catalog", (_req, res) => res.sendFile("reference-catalog.html", { root: "public" }));
app.get("/app/reference-catalog.html", (_req, res) => res.sendFile("reference-catalog.html", { root: "public" }));
app.get("/api/reference/catalog", (_req, res) => res.json({ ok: true, ...referenceCatalogConfig, gate: gateState() }));
app.get("/api/reference/catalog/:category", async (req, res) => {
  const category = referenceCatalogConfig.categories.find((item) => item.id === req.params.category);
  if (!category) return res.status(404).json({ ok: false, reason: "REFERENCE_CATEGORY_NOT_FOUND" });
  if (referenceCache.has(category.id)) return res.json({ ok: true, referenceOnly: true, category: category.name, products: referenceCache.get(category.id) });
  try {
    const response = await fetch(REFERENCE_RAW_BASE + "/" + category.file, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error("reference fetch failed: HTTP " + response.status);
    const payload = await response.json();
    const products = Array.isArray(payload) ? payload : (payload.products || payload.items || []);
    referenceCache.set(category.id, products);
    return res.json({ ok: true, referenceOnly: true, category: category.name, products });
  } catch (error) {
    return res.status(502).json({ ok: false, referenceOnly: true, category: category.name, reason: "REFERENCE_CATALOG_FETCH_FAILED", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.get("/api/reference/alfouad", (_req, res) => {
  res.json({
    ok: true,
    reference: "AlFouad Pharmacies",
    sourceUrl: "https://alfouadpharmacies.com/",
    mode: "taxonomy-and-storefront-reference",
    commercialGate: gateState(),
    policy: "Reference taxonomy/UX only; PM publication still requires PM-owned evidence"
  });
});

app.get("/api/health", healthResponse);

app.get("/api/start", (_req, res) => {
  const gate = gateState();
  return res.json({
    ok: true,
    service: "pmcosmetics-empire-11countries",
    started: true,
    runtime: "node scripts/start.mjs",
    port: Number(process.env.PORT || 3000),
    gate,
    productEvidenceGate: productEvidenceGateState(),
    commercialCatalogLive: commercialCatalogLiveState(),
    commercialWrites: gate === "OPEN" ? "GATE_OPEN" : "LOCKED",
    readOnly: true,
    healthcheck: "/api/health",
    workspaceHub: "/api/workspace/hub?action=status",
    workspaceHubSync: "/api/workspace/hub?action=sync",
    message: "PM Cosmetics Hub API is running."
  });
});


const getWorkspaceHubSnapshot = async () => {
  const readyEvidence = Array.from(authoritativePublishReadyBySku.values()).map((product) => ({
    sku: String(product.sku || "").trim(),
    name: String(product.name || "").trim(),
    status: String(product.status || "").trim(),
    publishGate: String(product.publish_gate || "").trim()
  })).filter((product) => product.sku);

  let activeProducts = [];
  let activeCatalogError = null;
  try {
    const rows = await listActiveProducts();
    activeProducts = Array.isArray(rows) ? rows : [];
  } catch (error) {
    activeCatalogError = error?.code || "ACTIVE_CATALOG_READ_FAILED";
  }

  const readyBySku = new Map(readyEvidence.map((product) => [product.sku, product]));
  const activeBySku = new Map(
    activeProducts
      .map((product) => [String(product?.sku || "").trim(), product])
      .filter(([sku]) => sku)
  );

  const activeWithReadyEvidence = activeProducts
    .map((product) => String(product?.sku || "").trim())
    .filter((sku) => sku && readyBySku.has(sku));
  const activeWithoutReadyEvidence = activeProducts
    .map((product) => String(product?.sku || "").trim())
    .filter((sku) => sku && !readyBySku.has(sku));
  const readyEvidenceNotActive = readyEvidence
    .map((product) => product.sku)
    .filter((sku) => !activeBySku.has(sku));

  const reconciliationAvailable = !activeCatalogError;
  const reconciled = reconciliationAvailable &&
    activeWithoutReadyEvidence.length === 0 &&
    readyEvidenceNotActive.length === 0;

  const templateSync = evaluateTemplateSyncBatch(
    activeProducts.map((product) => {
      const sku = String(product?.sku || "").trim();
      const evidence = readyBySku.get(sku);
      const evidenceRecord = (Array.isArray(evidenceSnapshot.products) ? evidenceSnapshot.products : [])
        .find((item) => String(item?.sku || "").trim() === sku);
      return {
        ...product,
        sku,
        status: evidence?.status || "",
        publish_gate: evidence?.publishGate || "",
        publishable: Boolean(evidence),
        evidenceVerified: Boolean(evidence),
        gtin: String(evidenceRecord?.gtin?.text || evidenceRecord?.gtin || "").trim(),
        imageUrl: String(product?.image_url || "").trim(),
        stock: evidenceRecord ? Number(evidenceRecord.pm_stock || 0) : 0,
        cost: evidenceRecord ? Number(evidenceRecord.pm_cost_egp || 0) : 0,
        retail_price: product?.base_price,
        public_price: product?.base_price,
        priceLocal: { EGP: product?.base_price }
      };
    }),
    { targetCurrency: process.env.WOOCOMMERCE_TARGET_CURRENCY || "EGP" }
  );

  return {
    service: "pmcosmetics-empire-11countries",
    gate: gateState(),
    commercialWrites: gateState() === "OPEN" ? "GATE_OPEN" : "LOCKED",
    batchPublishGate: batchGateState(),
    readOnly: true,
    publicationGatePreserved: true,
    sourceOfTruth: [
      "data/products/staging-evidence.json",
      "Supabase active Product Master",
      "config/empire-unified-registry.json"
    ],
    evidence: {
      totalRecords: Array.isArray(evidenceSnapshot.products) ? evidenceSnapshot.products.length : 0,
      publishReady: readyEvidence.length
    },
    activeCatalog: {
      totalActive: activeProducts.length,
      publishReadyAligned: activeWithReadyEvidence.length,
      activeWithoutPublishReadyEvidence: activeWithoutReadyEvidence.length
    },
    reconciliation: {
      available: reconciliationAvailable,
      status: !reconciliationAvailable ? "UNAVAILABLE" : reconciled ? "ALIGNED" : "DRIFT_DETECTED",
      activeWithoutPublishReadyEvidence: activeWithoutReadyEvidence,
      publishReadyNotActive: readyEvidenceNotActive,
      error: activeCatalogError
    },
    publishReadyProducts: readyEvidence,
    sync: {
      mode: "READ_ONLY_RECONCILIATION",
      writePerformed: false,
      externalChannelsWritten: [],
      templateGate: {
        enforced: true,
        targetCurrency: String(process.env.WOOCOMMERCE_TARGET_CURRENCY || "EGP").toUpperCase(),
        inputCount: templateSync.inputCount,
        readyCount: templateSync.eligibleCount,
        blockedCount: templateSync.blockedCount,
        blocked: templateSync.blocked.map(({ sku, targetCurrency, reasons }) => ({ sku, targetCurrency, reasons }))
      },
      nextSafeAction: reconciled
        ? "Keep commercial writes locked; continue only with evidence-gated operations."
        : "Resolve reconciliation drift before any publication attempt."
    }
  };
};

app.get("/api/workspace/hub", rateLimit, async (req, res) => {
  const action = String(req.query.action || "status").trim().toLowerCase();
  if (action !== "status" && action !== "sync") {
    return res.status(400).json({
      ok: false,
      gate: gateState(),
      reason: "WORKSPACE_HUB_ACTION_NOT_SUPPORTED",
      supportedActions: ["status", "sync"]
    });
  }

  try {
    const snapshot = await getWorkspaceHubSnapshot();
    return res.json({
      ok: true,
      action,
      ...(action === "sync"
        ? {
            syncExecuted: true,
            syncMode: "READ_ONLY_RECONCILIATION",
            writePerformed: false
          }
        : {}),
      ...snapshot
    });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      action,
      gate: gateState(),
      reason: "WORKSPACE_HUB_UNAVAILABLE",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});


const whatsappConfigState = () => ({
  webhook: {
    configured: Boolean(process.env.WHATSAPP_BUSINESS_VERIFY_TOKEN && process.env.WHATSAPP_WEBHOOK_SECRET),
    path: "/api/whatsapp/webhook"
  },
  cloudApi: {
    configured: Boolean(process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN && process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID)
  },
  routing: {
    primary: brandConfig.phones.primary.wa,
    catalog: brandConfig.whatsappCatalog
  }
});

const whatsappSignatureValid = (req) => {
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  const signature = String(req.headers["x-hub-signature-256"] || "");
  const rawBody = req.rawBody;
  if (!secret || !rawBody || !signature.startsWith("sha256=")) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

const shopifySignatureValid = (req) => {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const signature = String(req.headers["x-shopify-hmac-sha256"] || "");
  const rawBody = req.rawBody;
  if (!secret || !rawBody || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};


app.get("/api/channel/status", rateLimit, requireEmpireAuth, (_req, res) => {
  res.json({
    ok: true,
    gate: gateState(),
    empire: {
      service: "pmcosmetics-empire-11countries",
      liveDomain: process.env.RAILWAY_PUBLIC_DOMAIN || "https://pmcosmetics-empire-11countries-production.up.railway.app"
    },
    whatsapp: {
      primary: process.env.WHATSAPP_PRIMARY_PUBLIC_NUMBER || brandConfig.phones.primary.international,
      cloudApiConfigured: Boolean(
        process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN &&
        process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID
      )
    },
    gmail: {
      primary: process.env.PM_AUTH_EMAIL_PRIMARY || "shukrypeter79@gmail.com",
      secondary: process.env.PM_AUTH_EMAIL_SECONDARY || "shukrypeter102@gmail.com",
      oauthConnectorAvailable: false,
      note: "Gmail connector unavailable in the current ChatGPT workspace"
    },
    commerce: {
      canonicalBrand: brandConfig.brandName,
      referenceCatalog: "AlFouad Pharmacies",
      commercialPublication: gateState() === "OPEN" ? "OPEN" : "LOCKED"
    }
  });
});

app.get("/api/whatsapp/status", (_req, res) => {
  res.json({ ok: true, gate: gateState(), service: "whatsapp-cloud-api", ...whatsappConfigState() });
});

app.get("/api/shopify/webhook", (_req, res) => {
  res.json({
    ok: true,
    gate: gateState(),
    service: "shopify-webhook",
    configured: Boolean(process.env.SHOPIFY_WEBHOOK_SECRET),
    method: "POST",
    verification: "X-Shopify-Hmac-Sha256"
  });
});

app.post("/api/shopify/webhook", (req, res) => {
  if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
    return res.status(503).json({ ok: false, gate: gateState(), reason: "SHOPIFY_WEBHOOK_NOT_CONFIGURED" });
  }
  if (!shopifySignatureValid(req)) {
    return res.status(401).json({ ok: false, gate: gateState(), reason: "SHOPIFY_WEBHOOK_SIGNATURE_INVALID" });
  }
  return res.status(200).json({
    ok: true,
    gate: gateState(),
    received: true,
    processed: false,
    topic: String(req.headers["x-shopify-topic"] || ""),
    reason: "WEBHOOK_RECEIVED_GATED"
  });
});


app.get("/api/whatsapp/webhook", (req, res) => {
  const verifyToken = process.env.WHATSAPP_BUSINESS_VERIFY_TOKEN;
  if (!verifyToken) return res.status(503).json({ ok: false, gate: gateState(), reason: "WHATSAPP_WEBHOOK_NOT_CONFIGURED" });
  const mode = String(req.query["hub.mode"] || "");
  const token = String(req.query["hub.verify_token"] || "");
  const challenge = String(req.query["hub.challenge"] || "");
  if (mode === "subscribe" && token === verifyToken && challenge) return res.status(200).send(challenge);
  return res.status(403).send("Forbidden");
});

app.post("/api/whatsapp/webhook", (req, res) => {
  if (!process.env.WHATSAPP_WEBHOOK_SECRET) {
    return res.status(503).json({ ok: false, gate: gateState(), reason: "WHATSAPP_WEBHOOK_NOT_CONFIGURED" });
  }
  if (!whatsappSignatureValid(req)) {
    return res.status(401).json({ ok: false, gate: gateState(), reason: "WHATSAPP_WEBHOOK_SIGNATURE_INVALID" });
  }
  return res.status(200).json({
    ok: true,
    gate: gateState(),
    received: true,
    processed: false,
    reason: "WEBHOOK_RECEIVED_GATED"
  });
});

app.get("/api/amplitude/status", (_req, res) => res.json({ ok: true, ...getAmplitudeStatus() }));
app.get("/health", healthResponse);
app.get("/favicon.ico", (_req, res) => res.status(204).end());

app.get("/api/meta/status", rateLimit, (_req, res) => {
  const gate = gateState();
  const blockedWrites = gate !== "OPEN";
  const publishReadyProducts = Array.from(authoritativePublishReadyBySku.values()).map((product) => ({
    sku: String(product.sku || "").trim(),
    name: String(product.name || "").trim(),
    status: String(product.status || "").trim(),
    publishGate: String(product.publish_gate || "").trim()
  }));

  return res.json({
    ok: true,
    service: "pmcosmetics-empire-11countries",
    integration: "Meta AI",
    readOnly: true,
    gate,
    productEvidenceGate: productEvidenceGateState(),
    commercialCatalogLive: commercialCatalogLiveState(),
    mode: blockedWrites ? "CONTROLLED_PILOT" : "COMMERCIAL",
    commercialWrites: blockedWrites ? "LOCKED" : "GATE_OPEN",
    batchPublishGate: batchGateState(),
    publishReadyCount: publishReadyProducts.length,
    publishReadyProducts,
    externalWriteRoutes: {
      shopify: "LOCKED_BY_GATE",
      noon: "LOCKED_BY_GATE",
      amazon: "LOCKED_BY_GATE",
      jumia: "LOCKED_BY_GATE"
    },
    note: "Public read-only status for Meta AI; protected operational readiness remains at /api/readiness"
  });
});

app.get("/api/readiness", rateLimit, requireEmpireAuth, (_req, res) => {
  const gate = gateState();
  const manus = getManusStatus();
  const woocommerce = getWooStatus();
  const supabaseConfigured = isSupabaseConfigured();
  const markets = Array.isArray(marketConfig?.markets) ? marketConfig.markets : [];
  const blockedWrites = gate !== "OPEN";

  const response = {
    ok: true,
    service: "pmcosmetics-empire-11countries",
    gate,
    mode: blockedWrites ? "CONTROLLED_PILOT" : "COMMERCIAL",
    commercialWrites: blockedWrites ? "LOCKED" : "GATE_OPEN",
    batchPublishGate: batchGateState(),
    evidencePolicy: "PM-owned identity + exact image + stock + cost/provenance required before commercial publication",
    marketScope: {
      count: markets.length,
      canonicalConfig: "config/markets.json",
      launchValidationRequired: true
    },
    layers: {
      supabase: { configured: supabaseConfigured },
      manus: { configured: manus.configured, enabled: manus.enabled, maxProducts: manus.maxProducts, missing: manus.missing },
      woocommerce: { configured: woocommerce.configured, enabled: woocommerce.enabled, missing: woocommerce.missing }
    },
    externalWriteRoutes: {
      shopify: "LOCKED_BY_GATE",
      noon: "LOCKED_BY_GATE",
      amazon: "LOCKED_BY_GATE",
      jumia: "LOCKED_BY_GATE"
    }
  };
  void trackAmplitudeEvent("empire_readiness_viewed", {
    gate,
    mode: response.mode,
    commercialWrites: response.commercialWrites,
    marketCount: response.marketScope.count
  });
  return res.json(response);
});

app.get("/api/supabase/status", rateLimit, requireEmpireAuth, (_req, res) => {
  res.json({
    ok: true,
    gate: gateState(),
    configured: isSupabaseConfigured(),
    mode: isSupabaseConfigured() ? "read-only-products" : "not-configured"
  });
});

app.get("/api/manus/status", rateLimit, requireEmpireAuth, (_req, res) => {
  res.json({ ok: true, gate: gateState(), service: "manus-catalog-adapter", ...getManusStatus() });
});

app.post("/api/manus/import", async (req, res) => {
  try {
    const products = Array.isArray(req.body?.products) ? req.body.products : await pullManusProducts();
    const result = validateManusProducts(products);
    return res.json({
      ok: true,
      source: "Manus",
      ...result,
      message: result.publishable ? "Ready" : "Staged only: evidence gate remains closed"
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      gate: gateState(),
      reason: "MANUS_IMPORT_FAILED",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.post("/api/manus/woocommerce/sync", rateLimit, requireEmpireAuth, async (req, res) => {
  try {
    const products = Array.isArray(req.body?.products) ? req.body.products : await pullManusProducts();
    const dryRun = req.body?.dryRun !== false;

    if (!dryRun && gateState() !== "OPEN") {
      return res.status(503).json(locked("manus-woocommerce-sync", "COMMERCIAL_PUBLISH_GATE_CLOSED"));
    }

    const targetCurrency = String(req.body?.targetCurrency || process.env.WOOCOMMERCE_TARGET_CURRENCY || "").trim().toUpperCase();
    const prepared = await reconcileBatchProducts(products);
    const templateGate = evaluateTemplateSyncBatch(prepared, { targetCurrency });

    if (templateGate.blockedCount > 0) {
      return res.status(dryRun ? 200 : 422).json({
        ok: dryRun,
        source: "Manus",
        dryRun,
        gate: gateState(),
        templateGate: {
          enforced: true,
          targetCurrency,
          inputCount: templateGate.inputCount,
          readyCount: templateGate.eligibleCount,
          blockedCount: templateGate.blockedCount,
          blocked: templateGate.blocked.map(({ sku, targetCurrency: currency, reasons }) => ({ sku, targetCurrency: currency, reasons }))
        },
        reason: "TEMPLATE_SYNC_GATE_BLOCKED",
        message: "Only Product Master records that are Publish-Ready and explicitly priced in the target currency may reach a channel sync."
      });
    }

    const result = await syncWooProducts(templateGate.eligible, { dryRun });
    return res.json({
      ok: true,
      source: "Manus",
      templateGate: { enforced: true, targetCurrency, readyCount: templateGate.eligibleCount, blockedCount: 0 },
      ...result,
      gate: dryRun ? gateState() : "OPEN"
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      gate: gateState(),
      reason: "MANUS_WOOCOMMERCE_SYNC_FAILED",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/api/woocommerce/status", rateLimit, requireEmpireAuth, (_req, res) => {
  res.json({
    ok: true,
    gate: gateState(),
    service: "woocommerce-connector",
    ...getWooStatus()
  });
});

app.get("/api/woocommerce/check", rateLimit, requireEmpireAuth, async (_req, res) => {
  const result = await checkWooConnection();
  res.status(result.reachable ? 200 : result.configured ? 502 : 200).json({
    ...result,
    gate: gateState()
  });
});

app.post("/api/woocommerce/sync", rateLimit, requireEmpireAuth, async (req, res) => {
  try {
    const products = Array.isArray(req.body?.products) ? req.body.products : [];
    const dryRun = req.body?.dryRun !== false;

    if (products.length === 0) {
      return res.status(400).json({ ok: false, gate: gateState(), reason: "NO_PRODUCTS" });
    }

    if (!dryRun && gateState() !== "OPEN") {
      return res.status(503).json(locked("woocommerce-sync", "COMMERCIAL_PUBLISH_GATE_CLOSED"));
    }

    const targetCurrency = String(req.body?.targetCurrency || process.env.WOOCOMMERCE_TARGET_CURRENCY || "").trim().toUpperCase();
    const prepared = await reconcileBatchProducts(products);
    const templateGate = evaluateTemplateSyncBatch(prepared, { targetCurrency });

    void trackAmplitudeEvent("woocommerce_sync_requested", {
      dryRun,
      productCount: products.length,
      templateReadyCount: templateGate.eligibleCount,
      templateBlockedCount: templateGate.blockedCount,
      gate: gateState()
    });

    if (templateGate.blockedCount > 0) {
      return res.status(dryRun ? 200 : 422).json({
        ok: dryRun,
        gate: gateState(),
        templateGate: {
          enforced: true,
          targetCurrency,
          inputCount: templateGate.inputCount,
          readyCount: templateGate.eligibleCount,
          blockedCount: templateGate.blockedCount,
          blocked: templateGate.blocked.map(({ sku, targetCurrency: currency, reasons }) => ({ sku, targetCurrency: currency, reasons }))
        },
        reason: "TEMPLATE_SYNC_GATE_BLOCKED",
        message: "Sync stopped before channel payload generation."
      });
    }

    const result = await syncWooProducts(templateGate.eligible, { dryRun });
    return res.json({
      ...result,
      templateGate: { enforced: true, targetCurrency, readyCount: templateGate.eligibleCount, blockedCount: 0 },
      gate: dryRun ? gateState() : "OPEN"
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      gate: gateState(),
      reason: "WOOCOMMERCE_SYNC_FAILED",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/api/chat", (_req, res) => res.status(503).json(locked("chat")));
app.post("/api/chat", (_req, res) => res.status(503).json(locked("chat")));

app.get("/api/products", async (_req, res) => {
  try {
    const products = await listActiveProducts();
    void trackAmplitudeEvent("products_read", { productCount: Array.isArray(products) ? products.length : 0 });
    return res.json({
      ok: true,
      gate: gateState(),
      source: "Supabase",
      readOnly: true,
      publishable: false,
      products
    });
  } catch (error) {
    const reason = error?.code || "SUPABASE_PRODUCTS_READ_FAILED";
    return res.status(503).json({
      ok: false,
      gate: gateState(),
      source: "Supabase",
      readOnly: true,
      reason,
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/api/products/staging", rateLimit, requireEmpireAuth, (_req, res) => res.json({
  ok: true,
  gate: gateState(),
  publishable: false,
  source: "Airtable",
  feed: "/data/products/staging-evidence.json"
}));

app.post("/api/products/batch/readiness", rateLimit, requireEmpireAuth, async (req, res) => {
  try {
    const reconciled = await reconcileBatchProducts(req.body?.products);
    const result = evaluateBatch(reconciled);
    void trackAmplitudeEvent("batch_readiness_checked", {
      inputCount: result.inputCount,
      eligibleCount: result.eligibleCount,
      blockedCount: result.blockedCount,
      batchGate: batchGateState()
    });
    return res.json({
      ok: true,
      gate: gateState(),
      batchGate: batchGateState(),
      mode: "EVIDENCE_AWARE_BATCH",
      sourceOfTruth: "data/products/staging-evidence.json + Supabase active Product Master",
      ...result,
      publishableNow: result.inputCount > 0 &&
        result.eligibleCount === result.inputCount &&
        batchGateState() === "OPEN"
    });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      gate: gateState(),
      batchGate: batchGateState(),
      reason: "BATCH_EVIDENCE_RECONCILIATION_FAILED",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.post("/api/products/batch/publish", rateLimit, requireEmpireAuth, async (req, res) => {
  const dryRun = req.body?.dryRun !== false;
  let products;
  try {
    products = await reconcileBatchProducts(req.body?.products);
  } catch (error) {
    return res.status(503).json({
      ok: false,
      gate: gateState(),
      batchGate: batchGateState(),
      reason: "BATCH_EVIDENCE_RECONCILIATION_FAILED",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
  const result = evaluateBatch(products);

  if (products.length === 0) {
    return res.status(400).json({ ok: false, gate: gateState(), batchGate: batchGateState(), reason: "NO_PRODUCTS" });
  }

  // Safe bulk-publish default: skip blocked products and continue with evidence-qualified products.
  // Callers may explicitly set allowPartial=false to preserve all-or-nothing validation.
  const allowPartial = req.body?.allowPartial !== false;

  if (result.blockedCount > 0 && !allowPartial) {
    return res.status(422).json({
      ok: false,
      gate: gateState(),
      batchGate: batchGateState(),
      reason: "BATCH_CONTAINS_INELIGIBLE_PRODUCTS",
      allowPartial: false,
      ...result
    });
  }

  if (result.eligibleCount === 0) {
    return res.status(422).json({
      ok: false,
      gate: gateState(),
      batchGate: batchGateState(),
      reason: "NO_ELIGIBLE_PRODUCTS",
      ...result
    });
  }

  if (!dryRun && batchGateState() !== "OPEN") {
    return res.status(503).json({
      ok: false,
      gate: gateState(),
      batchGate: batchGateState(),
      reason: "BATCH_COMMERCIAL_PUBLISH_GATE_CLOSED",
      ...result
    });
  }

  if (dryRun) {
    return res.json({
      ok: true,
      dryRun: true,
      gate: gateState(),
      batchGate: batchGateState(),
      mode: allowPartial && result.blockedCount > 0 ? "VALIDATED_PARTIAL" : "VALIDATED_ONLY",
      allowPartial,
      ...result
    });
  }

  try {
    const channel = String(req.body?.channel || "woocommerce").toLowerCase();
    if (channel !== "woocommerce") {
      return res.status(501).json({
        ok: false,
        gate: gateState(),
        batchGate: batchGateState(),
        reason: "CHANNEL_ADAPTER_NOT_IMPLEMENTED",
        channel
      });
    }

    const publishResult = await syncWooProducts(result.eligible, { dryRun: false });
    return res.json({
      ok: true,
      dryRun: false,
      gate: gateState(),
      batchGate: batchGateState(),
      channel,
      allowPartial,
      ...result,
      publishResult
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      gate: gateState(),
      batchGate: batchGateState(),
      reason: "BATCH_PUBLISH_FAILED",
      message: error instanceof Error ? error.message : "Unknown error",
      ...result
    });
  }
});

app.post("/api/products", (_req, res) => res.status(503).json(locked("products")));
app.post("/api/shopify/sync", (_req, res) => res.status(503).json(locked("shopify-sync","SHOPIFY_NOT_VERIFIED")));
app.post("/api/noon/import", (_req, res) => res.status(503).json(locked("noon-import","NOON_NOT_VERIFIED")));
app.post("/api/amazon/import", (_req, res) => res.status(503).json(locked("amazon-import","AMAZON_NOT_VERIFIED")));
app.post("/api/jumia/import", (_req, res) => res.status(503).json(locked("jumia-import","JUMIA_NOT_VERIFIED")));

export default app;
