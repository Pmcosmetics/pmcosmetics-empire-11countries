import test from 'node:test';
import assert from 'node:assert/strict';
import { productRoutes } from '../src/routes/products.js';
import { skuRoutes } from '../src/routes/skus.js';

test('product collection route is available', async () => {
  const result = await productRoutes({ method: 'GET', url: '/api/v1/products' });
  assert.equal(result.status, 200);
});

test('sku creation route is available', async () => {
  const result = await skuRoutes({ method: 'POST', url: '/api/v1/skus' });
  assert.equal(result.status, 201);
});
