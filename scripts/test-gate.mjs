import assert from "node:assert/strict";
import app from "../server/index.mjs";

assert.equal(typeof app, "function");
assert.equal(typeof app.get, "function");

const server = app.listen(0);
const { port } = server.address();

try {
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

  const readiness = await fetch(`http://127.0.0.1:${port}/api/readiness`);
  assert.equal(readiness.status, 200);
  const readinessBody = await readiness.json();
  assert.equal(readinessBody.ok, true);
  assert.equal(readinessBody.mode, "CONTROLLED_PILOT");
  assert.equal(readinessBody.commercialWrites, "LOCKED");
  assert.equal(readinessBody.marketScope.count, 11);
  assert.equal(readinessBody.marketScope.launchValidationRequired, true);
  assert.equal(readinessBody.externalWriteRoutes.shopify, "LOCKED_BY_GATE");
  assert.equal(readinessBody.externalWriteRoutes.noon, "LOCKED_BY_GATE");

  const manus = await fetch(`http://127.0.0.1:${port}/api/manus/status`);
  assert.equal(manus.status, 200);
  const manusBody = await manus.json();
  assert.equal(manusBody.ok, true);
  assert.equal(manusBody.gate, "CLOSED");

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

  const woo = await fetch(`http://127.0.0.1:${port}/api/woocommerce/status`);
  assert.equal(woo.status, 200);
  const wooBody = await woo.json();
  assert.equal(wooBody.ok, true);
  assert.equal(wooBody.gate, "CLOSED");

  const dryRun = await fetch(`http://127.0.0.1:${port}/api/woocommerce/sync`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dryRun: true, products: [
      { sku: "PM-TEST-001", name: "PM Test Product", price: 100, stock: 1 },
      { sku: "PM-TEST-001", name: "Duplicate" }
    ]})
  });
  assert.equal(dryRun.status, 200);
  const dryRunBody = await dryRun.json();
  assert.equal(dryRunBody.dryRun, true);
  assert.equal(dryRunBody.validCount, 1);
  assert.equal(dryRunBody.duplicateSkuCount, 1);

  const batch = [
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
  ];

  const batchReadiness = await fetch(`http://127.0.0.1:${port}/api/products/batch/readiness`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ products: batch })
  });
  assert.equal(batchReadiness.status, 200);
  const batchReadinessBody = await batchReadiness.json();
  assert.equal(batchReadinessBody.mode, "EVIDENCE_AWARE_BATCH");
  assert.equal(batchReadinessBody.inputCount, 2);
  assert.equal(batchReadinessBody.eligibleCount, 1);
  assert.equal(batchReadinessBody.blockedCount, 1);
  assert.equal(batchReadinessBody.publishableNow, false);

  const batchDryRun = await fetch(`http://127.0.0.1:${port}/api/products/batch/publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dryRun: true, products: [batch[0]] })
  });
  assert.equal(batchDryRun.status, 200);
  const batchDryRunBody = await batchDryRun.json();
  assert.equal(batchDryRunBody.dryRun, true);
  assert.equal(batchDryRunBody.eligibleCount, 1);
  assert.equal(batchDryRunBody.blockedCount, 0);
  assert.equal(batchDryRunBody.batchGate, "CLOSED");

  const partialBatchDryRun = await fetch(`http://127.0.0.1:${port}/api/products/batch/publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dryRun: true, allowPartial: true, products: batch })
  });
  assert.equal(partialBatchDryRun.status, 200);
  const partialBatchBody = await partialBatchDryRun.json();
  assert.equal(partialBatchBody.mode, "VALIDATED_PARTIAL");
  assert.equal(partialBatchBody.allowPartial, true);
  assert.equal(partialBatchBody.eligibleCount, 1);
  assert.equal(partialBatchBody.blockedCount, 1);

  const blockedBatchPublish = await fetch(`http://127.0.0.1:${port}/api/products/batch/publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dryRun: false, products: [batch[0]] })
  });
  assert.equal(blockedBatchPublish.status, 503);
  const blockedBatchBody = await blockedBatchPublish.json();
  assert.equal(blockedBatchBody.reason, "BATCH_COMMERCIAL_PUBLISH_GATE_CLOSED");

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
