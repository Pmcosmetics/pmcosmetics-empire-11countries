import assert from 'assert';
import { productRoutes } from '../src/routes/products.js';

test('POST /api/v1/products valid', async () => {
  const req = { method: 'POST', url: '/api/v1/products', body: { name: 'Test Product' } };
  const res = await productRoutes(req);
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.accepted, true);
});

test('POST /api/v1/products invalid', async () => {
  const req = { method: 'POST', url: '/api/v1/products', body: {} };
  const res = await productRoutes(req);
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test('GET /api/v1/products list', async () => {
  const req = { method: 'GET', url: '/api/v1/products' };
  const res = await productRoutes(req);
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.data));
});
