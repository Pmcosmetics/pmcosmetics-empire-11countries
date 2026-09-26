import assert from "node:assert/strict";
import app from "../server/index.mjs";

assert.equal(typeof app, "function");
assert.equal(typeof app.get, "function");

const server = app.listen(0);
const { port } = server.address();

try {
  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(health.status, 200);
  const healthBody = await health.json();
  assert.equal(healthBody.ok, true);
  assert.equal(healthBody.gate, "CLOSED");
  assert.equal(healthBody.service, "pmcosmetics-empire-11countries");
  assert.equal(healthBody.runtime, "Vercel");
  assert.equal(healthBody.dataSource, "Airtable");
  assert.deepEqual(healthBody.architecture, ["ChatGPT","Products OS","Airtable","Vercel","Shopify","Noon","Amazon","Jumia"]);

  const products = await fetch(`http://127.0.0.1:${port}/api/products`);
  assert.equal(products.status, 503);
  const productsBody = await products.json();
  assert.equal(productsBody.ok, false);
  assert.equal(productsBody.gate, "CLOSED");
  assert.equal(productsBody.reason, "DATA_INTAKE_LOCKED");
} finally {
  server.close();
}

console.log("Gate API contract tests passed");
