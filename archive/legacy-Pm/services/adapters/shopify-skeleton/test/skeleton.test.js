import assert from 'assert';
import { assertAdapter } from '../../../../adapters/contract/interfaces.js';
import adapter from '../src/index.js';

test('adapter implements required interface', () => {
  assert.doesNotThrow(() => assertAdapter(adapter));
});

test('pushProduct accepts idempotency context and returns mock ok', async () => {
  const payload = { product: { product_code: 'SKU-001', name: 'Test Product' } };
  const context = { idempotencyKey: 'test-key-1' };
  const res = await adapter.pushProduct(payload, context);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.mock, true);
});

test('pushInventory returns mock ok', async () => {
  const payload = { inventory: { sku: 'SKU-001', quantity: 100 } };
  const context = { idempotencyKey: 'inv-key-1' };
  const res = await adapter.pushInventory(payload, context);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.mock, true);
});
