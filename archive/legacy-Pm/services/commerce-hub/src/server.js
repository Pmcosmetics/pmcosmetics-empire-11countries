import { createServer } from 'node:http';
import { productRoutes } from './routes/products.js';
import { skuRoutes } from './routes/skus.js';

const port = Number(process.env.PORT || 3000);

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') return sendJson(res, 200, { ok: true, service: 'commerce-hub' });

  const productResponse = await productRoutes(req);
  if (productResponse) return sendJson(res, productResponse.status, productResponse.body);

  const skuResponse = await skuRoutes(req);
  if (skuResponse) return sendJson(res, skuResponse.status, skuResponse.body);

  return sendJson(res, 404, { error: 'not_found' });
});

server.listen(port, () => console.log(`commerce-hub listening on :${port}`));
