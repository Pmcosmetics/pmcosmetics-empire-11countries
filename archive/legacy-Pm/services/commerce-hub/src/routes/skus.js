const methods = new Set(['GET', 'POST', 'PATCH']);

export async function skuRoutes(req) {
  const match = new URL(req.url, 'http://localhost').pathname.match(/^\/api\/v1\/skus(?:\/([^/]+))?$/);
  if (!match || !methods.has(req.method)) return null;

  const id = match[1] ?? null;
  if (req.method === 'GET') return { status: 200, body: { data: id ? { id } : [] } };
  if (req.method === 'POST') return { status: 201, body: { data: { accepted: true } } };
  if (req.method === 'PATCH' && id) return { status: 200, body: { data: { id, updated: true } } };
  return { status: 405, body: { error: 'method_not_allowed' } };
}
