import express from "express";
import helmet from "helmet";
import cors from "cors";
import { createRequire } from "node:module";
import { createHmac, timingSafeEqual } from "node:crypto";
import { checkWooConnection, getWooStatus, syncWooProducts } from "./integrations/woocommerce.mjs";
import { getManusStatus, pullManusProducts, validateManusProducts } from "./integrations/manus.mjs";
import { isSupabaseConfigured, listActiveProducts } from "./integrations/supabase.mjs";
import { evaluateBatch } from "../scripts/batch-gate.mjs";
import { getAmplitudeStatus, trackAmplitudeEvent } from "./integrations/amplitude.mjs";

const require = createRequire(import.meta.url);
const marketConfig = require("../config/markets.json");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "25mb", verify: (req, _res, buf) => { req.rawBody = Buffer.from(buf); } }));

const gateState = () => String(process.env.COMMERCIAL_PUBLISH_GATE || "CLOSED").toUpperCase() === "OPEN" ? "OPEN" : "CLOSED";
const batchGateState = () => String(process.env.BATCH_COMMERCIAL_PUBLISH_GATE || "CLOSED").toUpperCase() === "OPEN" ? "OPEN" : "CLOSED";

const locked = (service, reason = "DATA_INTAKE_LOCKED") => ({
  ok: false, service, status: 503, gate: gateState(), reason
});

const healthResponse = (_req, res) => res.json({
  ok: true,
  service: "pmcosmetics-empire-11countries",
  gate: gateState(),
  runtime: "Vercel/Railway",
  dataSource: isSupabaseConfigured() ? "Supabase" : "Airtable",
  supabaseConfigured: isSupabaseConfigured(),
  architecture: ["ChatGPT","Products OS","Airtable","Supabase","Vercel","Railway","Manus","WooCommerce","Shopify","Noon","Amazon","Jumia"]
});

app.get("/", (_req, res) => res.json({
  ok: true,
  service: "pmcosmetics-empire-11countries",
  gate: gateState(),
  message: "PM Cosmetics Hub API is running on Vercel/Railway",
  health: "/api/health",
  healthAlias: "/health",
  readiness: "/api/readiness",
  products: "/api/products",
  staging: "/api/products/staging",
  manus: "/api/manus/status",
  supabase: "/api/supabase/status",
  woocommerce: "/api/woocommerce/status"
}));

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

const whatsappConfigState = () => ({
  webhook: {
    configured: Boolean(process.env.WHATSAPP_BUSINESS_VERIFY_TOKEN && process.env.WHATSAPP_WEBHOOK_SECRET),
    path: "/api/whatsapp/webhook"
  },
  cloudApi: {
    configured: Boolean(process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN && process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID)
  },
  routing: {
    primary: "https://wa.me/201055655649",
    backup: "https://wa.me/201203151461",
    catalog: "https://wa.me/c/201055655649"
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

app.get("/api/channel/status", (_req, res) => {
  res.json({
    ok: true,
    gate: gateState(),
    empire: {
      service: "pmcosmetics-empire-11countries",
      liveDomain: process.env.RAILWAY_PUBLIC_DOMAIN || "https://pmcosmetics-empire-11countries-production.up.railway.app"
    },
    whatsapp: {
      primary: process.env.WHATSAPP_PRIMARY_PUBLIC_NUMBER || "201055655649",
      backup: process.env.WHATSAPP_BACKUP_PUBLIC_NUMBER || "201203151461",
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
      canonicalBrand: "Pmcosmetics Hub",
      referenceCatalog: "AlFouad Pharmacies",
      commercialPublication: gateState() === "OPEN" ? "OPEN" : "LOCKED"
    }
  });
});

app.get("/api/whatsapp/status", (_req, res) => {
  res.json({ ok: true, gate: gateState(), service: "whatsapp-cloud-api", ...whatsappConfigState() });
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

app.get("/api/readiness", (_req, res) => {
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

app.get("/api/supabase/status", (_req, res) => {
  res.json({
    ok: true,
    gate: gateState(),
    configured: isSupabaseConfigured(),
    mode: isSupabaseConfigured() ? "read-only-products" : "not-configured"
  });
});

app.get("/api/manus/status", (_req, res) => {
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

app.post("/api/manus/woocommerce/sync", async (req, res) => {
  try {
    const products = Array.isArray(req.body?.products) ? req.body.products : await pullManusProducts();
    const dryRun = req.body?.dryRun !== false;

    if (!dryRun && gateState() !== "OPEN") {
      return res.status(503).json(locked("manus-woocommerce-sync", "COMMERCIAL_PUBLISH_GATE_CLOSED"));
    }

    const result = await syncWooProducts(products, { dryRun });
    return res.json({ ok: true, source: "Manus", ...result, gate: dryRun ? gateState() : "OPEN" });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      gate: gateState(),
      reason: "MANUS_WOOCOMMERCE_SYNC_FAILED",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/api/woocommerce/status", (_req, res) => {
  res.json({
    ok: true,
    gate: gateState(),
    service: "woocommerce-connector",
    ...getWooStatus()
  });
});

app.get("/api/woocommerce/check", async (_req, res) => {
  const result = await checkWooConnection();
  res.status(result.reachable ? 200 : result.configured ? 502 : 200).json({
    ...result,
    gate: gateState()
  });
});

app.post("/api/woocommerce/sync", async (req, res) => {
  try {
    const products = Array.isArray(req.body?.products) ? req.body.products : [];
    const dryRun = req.body?.dryRun !== false;

    if (products.length === 0) {
      return res.status(400).json({ ok: false, gate: gateState(), reason: "NO_PRODUCTS" });
    }

    if (!dryRun && gateState() !== "OPEN") {
      return res.status(503).json(locked("woocommerce-sync", "COMMERCIAL_PUBLISH_GATE_CLOSED"));
    }

    void trackAmplitudeEvent("woocommerce_sync_requested", {
      dryRun,
      productCount: products.length,
      gate: gateState()
    });
    const result = await syncWooProducts(products, { dryRun });
    return res.json({ ...result, gate: dryRun ? gateState() : "OPEN" });
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

app.get("/api/products/staging", (_req, res) => res.json({
  ok: true,
  gate: gateState(),
  publishable: false,
  source: "Airtable",
  feed: "/data/products/staging-evidence.json"
}));

app.post("/api/products/batch/readiness", (req, res) => {
  const result = evaluateBatch(req.body?.products);
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
    ...result,
    publishableNow: result.inputCount > 0 &&
      result.eligibleCount === result.inputCount &&
      batchGateState() === "OPEN"
  });
});

app.post("/api/products/batch/publish", async (req, res) => {
  const products = Array.isArray(req.body?.products) ? req.body.products : [];
  const dryRun = req.body?.dryRun !== false;
  const result = evaluateBatch(products);

  if (products.length === 0) {
    return res.status(400).json({ ok: false, gate: gateState(), batchGate: batchGateState(), reason: "NO_PRODUCTS" });
  }

  const allowPartial = req.body?.allowPartial === true;

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
