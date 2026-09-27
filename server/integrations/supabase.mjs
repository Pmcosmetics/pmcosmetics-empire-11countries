const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "";

export const isSupabaseConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

const assertConfigured = () => {
  if (!isSupabaseConfigured()) {
    const error = new Error("SUPABASE_NOT_CONFIGURED");
    error.code = "SUPABASE_NOT_CONFIGURED";
    throw error;
  }
};

export async function listActiveProducts() {
  assertConfigured();

  const url = new URL(`${SUPABASE_URL}/rest/v1/products`);
  url.searchParams.set(
    "select",
    "id,sku,name,description,category_id,base_price,currency,is_active,image_url,updated_at"
  );
  url.searchParams.set("is_active", "eq.true");
  url.searchParams.set("order", "updated_at.desc");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      Accept: "application/json"
    }
  });

  const body = await response.text();

  if (!response.ok) {
    const error = new Error(`Supabase REST ${response.status}: ${body.slice(0, 500)}`);
    error.code = "SUPABASE_REST_ERROR";
    error.status = response.status;
    throw error;
  }

  try {
    return JSON.parse(body);
  } catch {
    const error = new Error("SUPABASE_INVALID_JSON");
    error.code = "SUPABASE_INVALID_JSON";
    throw error;
  }
}
