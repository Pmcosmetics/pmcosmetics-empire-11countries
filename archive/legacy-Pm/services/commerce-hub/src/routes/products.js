const allowed = new Set(['GET', 'POST', 'PATCH', 'DELETE']);
import { validateProduct } from '../validators.js';

export async function productRoutes(req) {
  const match = new URL(req.url, 'http://localhost').pathname.match(/^\/api\/v1\/products(?:\/([^/]+))?$/);
  if (!match || !allowed.has(req.method)) return null;

  const id = match[1] ?? null;
  if (req.method === 'GET') return { status: 200, body: { data: id ? { id } : [] } };
  if (req.method === 'POST') {
    const body = req.body ?? {};
    const res = validateProduct(body);
    if (!res.valid) return { status: 400, body: { error: res.error } };
    return { status: 201, body: { data: { accepted: true } } };
  }
  if (req.method === 'PATCH' && id) {
    const body = req.body ?? {};
    // For PATCH we allow partial updates; validate only if name is present
    if ('name' in body) {
      const res = validateProduct(body);
      if (!res.valid) return { status: 400, body: { error: res.error } };
    }
    return { status: 200, body: { data: { id, updated: true } } };
  }
  if (req.method === 'DELETE' && id) return { status: 204, body: null };
  return { status: 405, body: { error: 'method_not_allowed' } };
}
