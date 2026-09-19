import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePrice } from '../src/pricing/engine.js';
import { createAuditEvent } from '../src/audit/logger.js';
import { inventoryRoute } from '../src/routes/inventory.js';

test('pricing applies bounds', () => {
  assert.equal(calculatePrice({ basePrice: 100, adjustment: 25, maxPrice: 110 }), 110);
});

test('pricing rejects invalid bounds', () => {
  assert.throws(
    () => calculatePrice({ basePrice: 100, minPrice: 120, maxPrice: 110 }),
    { message: 'invalid_price_bounds' }
  );
});

test('audit event captures actor and changes', () => {
  const event = createAuditEvent({ actorId: 'actor-1', action: 'update', entityType: 'sku', entityId: 'sku-1', changes: { active: false } });
  assert.equal(event.actorId, 'actor-1');
  assert.deepEqual(event.changes, { active: false });
});

test('inventory route accepts supported POST actions', () => {
  const result = inventoryRoute({ method: 'POST', url: '/api/v1/inventory/sku-1/reserve' });
  assert.deepEqual(result, {
    status: 202,
    body: { data: { skuId: 'sku-1', action: 'reserve', accepted: true } }
  });
});

test('inventory route rejects unsupported methods', () => {
  const result = inventoryRoute({ method: 'GET', url: '/api/v1/inventory/sku-1/reserve' });
  assert.deepEqual(result, { status: 405, body: { error: 'method_not_allowed' } });
});
