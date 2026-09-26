import express from "express";
import helmet from "helmet";
import cors from "cors";
import { getWooStatus, syncWooProducts } from "./integrations/woocommerce.mjs";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const locked = (service, reason = "DATA_INTAKE_LOCKED") => ({
  ok: false, service, status: 503, gate: "CLOSED", reason
});

app.get("/", (_req, res) => res.json({
  ok: true,
  service: "pmcosmetics-empire-11countries",
  gate: "CLOSED",
  message: "PM Cosmetics Hub API is running on Vercel/Railway",
  health: "/api/health",
  products: "/api/products",
  staging: "/api/products/staging",
  woocommerce: "/api/woocommerce/status"
}));

app.get("/api/health", (_req, res) => res.json({
  ok: true,
  service: "pmcosmetics-empire-11countries",
  gate: "CLOSED",
  runtime: "Vercel/Railway",
  dataSource: "Airtable",
  architecture: ["ChatGPT","Products OS","Airtable","Vercel","Railway","WooCommerce","Shopify","Noon","Amazon","Jumia"]
}));

app.get("/api/woocommerce/status", (_req, res) => {
  res.json({
    ok: true,
    gate: "CLOSED",
    service: "woocommerce-connector",
    ...getWooStatus()
  });
});

app.post("/api/woocommerce/sync", async (req, res) => {
  try {
    const products = Array.isArray(req.body?.products) ? req.body.products : [];
    const dryRun = req.body?.dryRun !== false;

    if (products.length === 0) {
      return res.status(400).json({ ok: false, gate: "CLOSED", reason: "NO_PRODUCTS" });
    }

    if (!dryRun && process.env.COMMERCIAL_PUBLISH_GATE !== "OPEN") {
      return res.status(503).json(locked("woocommerce-sync", "COMMERCIAL_PUBLISH_GATE_CLOSED"));
    }

    const result = await syncWooProducts(products, { dryRun });
    return res.json({ ...result, gate: dryRun ? "CLOSED" : "OPEN" });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      gate: "CLOSED",
      reason: "WOOCOMMERCE_SYNC_FAILED",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.post("/api/chat", (_req, res) => res.status(503).json(locked("chat")));
app.get("/api/products", (_req, res) => res.status(503).json(locked("products")));
app.get("/api/products/staging", (_req, res) => res.json({ ok: true, gate: "CLOSED", publishable: false, source: "Airtable", feed: "/data/products/staging-evidence.json" }));
app.post("/api/products", (_req, res) => res.status(503).json(locked("products")));
app.post("/api/shopify/sync", (_req, res) => res.status(503).json(locked("shopify-sync","SHOPIFY_NOT_VERIFIED")));
app.post("/api/noon/import", (_req, res) => res.status(503).json(locked("noon-import","NOON_NOT_VERIFIED")));
app.post("/api/amazon/import", (_req, res) => res.status(503).json(locked("amazon-import","AMAZON_NOT_VERIFIED")));
app.post("/api/jumia/import", (_req, res) => res.status(503).json(locked("jumia-import","JUMIA_NOT_VERIFIED")));

export default app;
