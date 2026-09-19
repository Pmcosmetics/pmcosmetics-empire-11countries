export function validateProduct(body) {
  if (!body || typeof body !== 'object') return { valid: false, error: 'invalid_body' };
  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') return { valid: false, error: 'missing_name' };
  // Additional validations (product_code, attributes, pricing) can be added here later.
  return { valid: true };
}
