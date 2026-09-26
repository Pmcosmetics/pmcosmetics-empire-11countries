import express from "express";
import helmet from "helmet";
import cors from "cors";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const locked = (service, reason = "DATA_INTAKE_LOCKED") => ({
  ok: false, service, status: 503, gate: "CLOSED", reason
});

app.get("/", (_req, res) => res.json({
  ok: true,
  service: "pmcosmetics-empire-11countries",
  gate: "CLOSED",
  message: "PM Cosmetics Hub API is running",
  health: "/api/health",
  products: "/api/products",
  staging: "/api/products/staging"
}));

app.get("/api/health", (_req, res) => res.json({
  ok: true,
  service: "pmcosmetics-empire-11countries",
  gate: "CLOSED",
  architecture: ["ChatGPT","Products OS","Supabase","Shopify","Noon","Amazon","Jumia"]
}));

app.post("/api/chat", (_req, res) => res.status(503).json(locked("chat")));
app.get("/api/products", (_req, res) => res.status(503).json(locked("products")));
app.get("/api/products/staging", (_req, res) => res.json({ ok: true, gate: "CLOSED", publishable: false, source: "Airtable", feed: "/data/products/staging-evidence.json" }));
app.post("/api/products", (_req, res) => res.status(503).json(locked("products")));
app.post("/api/shopify/sync", (_req, res) => res.status(503).json(locked("shopify-sync","SHOPIFY_NOT_VERIFIED")));
app.post("/api/noon/import", (_req, res) => res.status(503).json(locked("noon-import","NOON_NOT_VERIFIED")));
app.post("/api/amazon/import", (_req, res) => res.status(503).json(locked("amazon-import","AMAZON_NOT_VERIFIED")));
app.post("/api/jumia/import", (_req, res) => res.status(503).json(locked("jumia-import","JUMIA_NOT_VERIFIED")));

export default app;
