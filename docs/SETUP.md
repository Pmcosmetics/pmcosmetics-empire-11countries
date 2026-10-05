# PM Cosmetics Hub — Setup & Launch Gate

## Current runtime

The canonical repository is deployed to Railway for the production API and is also structured for Vercel via `api/index.mjs` and `vercel.json`.

Runtime flow:

`Manus catalog -> validation -> Airtable evidence -> publication gate -> WooCommerce/Shopify/Noon/Amazon/Jumia`

The API intentionally keeps the commercial publication gate **CLOSED** until product identity, barcode/SKU, stock, price, and image evidence are verified.

## Integration endpoints

- `GET /api/health` — runtime and architecture health
- `GET /api/manus/status` — Manus adapter configuration
- `POST /api/manus/import` — validate a Manus product array or configured Manus feed; staging only
- `POST /api/manus/woocommerce/sync` — Manus → WooCommerce pipeline; dry-run by default
- `GET /api/woocommerce/status` — WooCommerce configuration state without exposing secrets
- `GET /api/woocommerce/check` — live WooCommerce connectivity check when credentials are configured
- `POST /api/woocommerce/sync` — batch create/update; dry-run by default
- `GET /api/products/staging` — evidence staging status

## WooCommerce configuration

Create WooCommerce REST API credentials with the minimum permissions required for the intended operation. WooCommerce supports API-key authentication over HTTPS, including Basic authentication with consumer key/secret.

Set these variables in Railway/Vercel secret storage:

`WOOCOMMERCE_URL`
`WOOCOMMERCE_CONSUMER_KEY`
`WOOCOMMERCE_CONSUMER_SECRET`
`WOOCOMMERCE_SYNC_ENABLED=true` only after connectivity is verified
`WOOCOMMERCE_BATCH_SIZE=50`

The connector reads existing products with pagination, matches on SKU, and uses WooCommerce's batch product endpoint for creates/updates. WooCommerce's product controller exposes batch create/update/delete operations.

## Manus catalog over 2,000 products

The Manus adapter accepts a configured HTTPS JSON feed or a direct JSON body. It validates SKU/name identity, removes duplicate SKUs from the run, and supports up to 10,000 records per run by configuration.

The Manus adapter does **not** automatically make the products publishable. Evidence remains required before any commercial sync.

## Verification sequence

```bash
npm ci
npm run build
npm run validate
npm test
```

Then verify:

```
GET /api/health
GET /api/manus/status
GET /api/woocommerce/status
GET /api/woocommerce/check
```

For a large Manus feed, run a dry-run first:

```json
{
  "dryRun": true
}
```

Only change `COMMERCIAL_PUBLISH_GATE` to `OPEN` after the evidence gate has been independently verified for the exact records being published.

## Security

- Never commit WooCommerce keys, Manus tokens, or other credentials.
- Keep secrets in Railway/Vercel secret storage.
- Use HTTPS for all remote integrations.
- Keep commercial publication CLOSED for unverified inventory.
- Do not treat a successful connector dry-run as evidence that PM owns the stock.



## WhatsApp Cloud API

The production server exposes /api/whatsapp/status, GET /api/whatsapp/webhook, and POST /api/whatsapp/webhook.

Callback URL:
https://pmcosmetics-empire-11countries-production.up.railway.app/api/whatsapp/webhook

Keep only these in Railway secret storage:
- WHATSAPP_BUSINESS_ACCESS_TOKEN
- WHATSAPP_BUSINESS_PHONE_NUMBER_ID
- WHATSAPP_BUSINESS_VERIFY_TOKEN
- WHATSAPP_WEBHOOK_SECRET

Meta verification must complete before the integration is considered live. The commercial publication gate remains independent and CLOSED.

## Authentication and Operations Dashboard

Authentication uses Supabase Auth with server-side exact-email allowlist verification.

Allowed administration identities:
- shukrypeter79@gmail.com
- shukrypeter102@gmail.com

Authentication endpoints:
- GET /api/auth/config
- GET /api/auth/session

Authenticated operations UI:
- /ops/dashboard.html

The dashboard reads catalog, inventory, currencies, orders, customer analytics and reporting from Supabase. It does not bypass the Product Evidence Gate or Commercial Publish Gate.

## Security deployment controls

Recommended production variables:

HTTPS_ONLY=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=60
COMMERCIAL_PUBLISH_GATE=CLOSED

Production credentials belong only in Railway/Vercel secret storage. Never commit or paste live provider credentials into Git, documentation, issues, or chat.

## Current live currency rule

The connected Shopify Egypt shop is verified as EGP. Keep Egyptian retail values in EGP. Any non-EGP channel requires an explicit target currency and verified conversion policy.
