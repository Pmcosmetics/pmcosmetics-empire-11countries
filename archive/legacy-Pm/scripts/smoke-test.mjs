const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const base = url.replace(/\/$/, '');
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
};

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const text = await response.text();
  let body = text;
  try { body = text ? JSON.parse(text) : null; } catch {}
  return { response, body };
}

let failed = false;

try {
  const validation = await request('/rest/v1/rpc/create_commerce_order', {
    method: 'POST',
    body: JSON.stringify({
      p_order_number: `SMOKE-${Date.now()}`,
      p_channel_code: 'smoke',
      p_currency: 'EGP',
      p_items: [],
    }),
  });

  if (validation.response.ok) {
    throw new Error('create_commerce_order unexpectedly accepted an empty items array');
  }

  const errorText = JSON.stringify(validation.body || '').toLowerCase();
  if (!errorText.includes('items must be a non-empty json array')) {
    throw new Error(`unexpected create_commerce_order validation response (${validation.response.status})`);
  }
  console.log('Commerce RPC validation: OK');

  const inactiveChannel = await request('/rest/v1/rpc/process_channel_order', {
    method: 'POST',
    body: JSON.stringify({
      p_channel_code: 'shopify',
      p_external_order_id: `SMOKE-${Date.now()}`,
      p_payload: {
        order_number: `SMOKE-${Date.now()}`,
        currency: 'EGP',
        items: [],
      },
    }),
  });

  if (inactiveChannel.response.ok) {
    throw new Error('process_channel_order unexpectedly accepted an inactive channel');
  }

  const channelError = JSON.stringify(inactiveChannel.body || '').toLowerCase();
  if (!channelError.includes('channel is not active')) {
    throw new Error(`unexpected process_channel_order response (${inactiveChannel.response.status})`);
  }
  console.log('Channel runtime guard: OK');

  console.log('SMOKE TEST: OK');
} catch (error) {
  failed = true;
  console.error('SMOKE TEST: FAILED', error?.message || error);
}

process.exit(failed ? 2 : 0);
