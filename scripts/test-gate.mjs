import assert from "node:assert/strict";
import app from "../server/index.mjs";

assert.equal(typeof app, "function");
assert.equal(typeof app.get, "function");

const server = app.listen(0);
const { port } = server.address();

async function assertAuthRequired(url, options = {}) {
  const response = await fetch(url, options);
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.authenticated, false);
  assert.equal(body.reason, "AUTH_TOKEN_MISSING");
}

try {
  const authConfig = await fetch(`http://127.0.0.1:${port}/api/auth/config`);
  assert.equal(authConfig.status, 200);
  const authConfigBody = await authConfig.json();
  assert.equal(authConfigBody.ok, true);
  assert.equal(authConfigBody.serverVerification, true);
  assert.equal(authConfigBody.exactEmailAllowlist, true);
  assert.equal(authConfigBody.allowedEmailCount, 2);

  const authSession = await fetch(`http://127.0.0.1:${port}/api/auth/session`);
  assert.equal(authSession.status, 401);
  const authSessionBody = await authSession.json();
  assert.equal(authSessionBody.authenticated, false);
  assert.equal(authSessionBody.reason, "AUTH_TOKEN_MISSING");

  const whatsappStatus = await fetch(`http://127.0.0.1:${port}/api/whatsapp/status`);
  assert.equal(whatsappStatus.status, 200);
  const whatsappStatusBody = await whatsappStatus.json();
  assert.equal(whatsappStatusBody.ok, true);
  assert.equal(whatsappStatusBody.routing.primary, "https://wa.me/201055655649");
  assert.equal(whatsappStatusBody.routing.catalog, "https://wa.me/c/201055655649");

  if (!whatsappStatusBody.webhook.configured) {
    const whatsappWebhook = await fetch(`http://127.0.0.1:${port}/api/whatsapp/webhook`);
    assert.equal(whatsappWebhook.status, 503);
  }

  const amplitudeStatus = await fetch(`http://127.0.0.1:${port}/api/amplitude/status`);
  assert.equal(amplitudeStatus.status, 200);
  const amplitudeBody = await amplitudeStatus.json();
  assert.equal(amplitudeBody.ok, true);
  assert.equal(amplitudeBody.configured, false);

  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(health.status, 200);
  const healthBody = await health.json();
  assert.equal(healthBody.ok, true);
  assert.equal(healthBody.gate, "CLOSED");
  assert.equal(healthBody.service, "pmcosmetics-empire-11countries");
  assert.equal(healthBody.supabaseConfigured, healthBody.dataSource === "Supabase");
  assert.deepEqual(healthBody.architecture, ["ChatGPT","Products OS","Airtable","Supabase","Vercel","Railway","Manus","WooCommerce","Shopify","Noon","Amazon","Jumia"]);

  await assertAuthRequired(`http://127.0.0.1:${port}/api/readiness`);

  await assertAuthRequired(`http://127.0.0.1:${port}/api/manus/status`);

  const manusImport = await fetch(`http://127.0.0.1:${port}/api/manus/import`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ products: [
      { sku: "PM-MANUS-001", name: "Manus Product A" },
      { sku: "PM-MANUS-001", name: "Duplicate" },
      { name: "Missing SKU" }
    ]})
  });
  assert.equal(manusImport.status, 200);
  const manusBody2 = await manusImport.json();
  assert.equal(manusBody2.validCount, 1);
  assert.equal(manusBody2.duplicateSkuCount, 1);
  assert.equal(manusBody2.invalidCount, 1);
  assert.equal(manusBody2.publishable, false);

  await assertAuthRequired(`http://127.0.0.1:${port}/api/woocommerce/status`);

  await assertAuthRequired(`http://127.0.0.1:${port}/api/woocommerce/sync`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dryRun: true, products: [
      { sku: "PM-TEST-001", name: "PM Test Product", price: 100, stock: 1 },
      { sku: "PM-TEST-001", name: "Duplicate" }
    ]})
  });

  await assertAuthRequired(`http://127.0.0.1:${port}/api/products/batch/readiness`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ products: [
      {
        sku: "PM-BATCH-001",
        name: "Verified Product",
        gtin: "1234567890123",
        imageUrl: "https://example.test/pm-batch-001.jpg",
        stock: 10,
        cost: 100,
        provenanceVerified: true,
        imageVerified: true,
        authorizationRequired: false
      },
      {
        sku: "PM-BATCH-002",
        name: "Blocked Product",
        gtin: "1234567890124",
        stock: 0,
        cost: 0,
        provenanceVerified: false,
        imageVerified: false,
        authorizationRequired: true,
        authorizationVerified: false
      }
    ]})
  });

  await assertAuthRequired(`http://127.0.0.1:${port}/api/products/batch/publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dryRun: true, products: [] })
  });

  await assertAuthRequired(`http://127.0.0.1:${port}/api/products/batch/publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dryRun: false, products: [] })
  });

  const products = await fetch(`http://127.0.0.1:${port}/api/products`);
  const productsBody = await products.json();
  assert.equal(productsBody.gate, "CLOSED");
  assert.equal(productsBody.source, "Supabase");
  assert.equal(productsBody.readOnly, true);
  if (products.status === 200) {
    assert.equal(productsBody.ok, true);
    assert.equal(productsBody.publishable, false);
    assert.ok(Array.isArray(productsBody.products));
  } else {
    assert.equal(products.status, 503);
    assert.equal(productsBody.ok, false);
    assert.ok(productsBody.reason);
  }
} finally {
  server.close();
}

console.log("Gate API contract tests passed");
