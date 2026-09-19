export function inventoryRoute(req) {
  const match = new URL(req.url, 'http://localhost').pathname.match(/^\/api\/v1\/inventory\/([^/]+)\/(adjust|reserve|commit)$/);
  if (!match) return null;
  const [, skuId, action] = match;
  if (!['POST'].includes(req.method)) return { status: 405, body: { error: 'method_not_allowed' } };
  return { status: 202, body: { data: { skuId, action, accepted: true } } };
}
