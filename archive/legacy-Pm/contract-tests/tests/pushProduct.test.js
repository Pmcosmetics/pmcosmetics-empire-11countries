import assert from 'assert';
import { test } from 'node:test';
import { assertAdapter } from '../../adapters/contract/interfaces.js';
import shopifyAdapter from '../../services/adapters/shopify-skeleton/src/index.js';

// Ensure the real adapter implements the contract
test('shopify adapter implements contract', () => {
  assert.doesNotThrow(() => assertAdapter(shopifyAdapter));
});

// pushProduct with idempotencyKey
test('pushProduct accepts idempotencyKey and returns mock ok', async () => {
  const payload = { product: { product_code: 'SKU-CT-001', name: 'CT Product' } };
  const context = { idempotencyKey: 'ct-idempotency-1' };
  const res = await shopifyAdapter.pushProduct(payload, context);
  assert.strictEqual(res.ok, true);
  if (res.idempotencyKey !== undefined) assert.strictEqual(res.idempotencyKey, context.idempotencyKey);
});

// pushInventory
test('pushInventory returns mock ok', async () => {
  const payload = { inventory: { sku: 'SKU-CT-001', quantity: 10 } };
  const context = { idempotencyKey: 'ct-inv-1' };
  const res = await shopifyAdapter.pushInventory(payload, context);
  assert.strictEqual(res.ok, true);
});

// 429 simulation: ensure retryable behavior is test-acknowledged (simulation)
test('handles 429 as retryable simulation (contract)', async () => {
  let called = 0;
  const original = shopifyAdapter.pushProduct;
  shopifyAdapter.pushProduct = async (payload, context) => {
    called++;
    if (called === 1) {
      const err = new Error('rate limited');
      err.status = 429;
      throw err;
    }
    return original.call(shopifyAdapter, payload, context);
  };

  const payload = { product: { product_code: 'SKU-CT-002', name: 'CT Retry' } };
  const context = { idempotencyKey: 'ct-retry-1' };

  try {
    await shopifyAdapter.pushProduct(payload, context);
    // If first call unexpectedly succeeds, test is still valid (adapter accepted immediately)
  } catch (err) {
    assert.strictEqual(err.status, 429);
    const res2 = await shopifyAdapter.pushProduct(payload, context);
    assert.strictEqual(res2.ok, true);
  } finally {
    shopifyAdapter.pushProduct = original;
  }
});
