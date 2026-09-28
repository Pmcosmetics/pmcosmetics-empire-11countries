# Central WooCommerce Backbone

WooCommerce is the planned central B2C storefront and commerce API layer for PM Cosmetics Hub.

## Control flow

Evidence → Supabase Product Master → Commercial Gate → WooCommerce → verification

The Commercial Gate remains **CLOSED** until product evidence is verified. The WooCommerce connector may be configured and health-checked while publication remains blocked.

## Required Railway variables

- `WOOCOMMERCE_URL` — HTTPS store origin only
- `WOOCOMMERCE_CONSUMER_KEY`
- `WOOCOMMERCE_CONSUMER_SECRET`
- `WOOCOMMERCE_SYNC_ENABLED` — keep `false` during staging
- `WOOCOMMERCE_BATCH_SIZE` — maximum 100

Secrets must never be committed to Git.

## API

- `GET /api/woocommerce/status` — configuration state, without exposing credentials
- `GET /api/woocommerce/check` — authenticated read-only connectivity check
- `POST /api/woocommerce/sync` — dry-run by default; live sync requires the Commercial Gate to be OPEN

Live product sync additionally requires both:

- `publishable: true`
- `evidenceVerified: true`

Unverified products are held back even if a global publication attempt is enabled.

## Current state

- Commercial Gate: **CLOSED**
- No bulk publication is authorized
- DERMAELLE028 remains an evidence-gated pilot candidate
- WooCommerce credentials are not currently connected to Railway

## Verification

WooCommerce REST API v3 is the current API for authenticated product operations. API keys are generated from WooCommerce/WordPress admin and should be stored only as deployment secrets.
