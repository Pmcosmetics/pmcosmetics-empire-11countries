# PM Cosmetics Hub — Integration Control Plane

## Canonical runtime

- Repository: `Pmcosmetics/pmcosmetics-empire-11countries`
- Branch: `main`
- Runtime: Railway Production
- Health: `/api/health`
- Commercial publish gate: CLOSED by default

## Verified operational connections

| System | Current state | Control |
|---|---|---|
| GitHub | Connected | Main code source; no admin/maintain permission |
| Railway | Live / healthy | Deploy from main; healthcheck enforced |
| Airtable | Connected | Product/evidence registry |
| Supabase | Configured/read-only API path | Product reads only until evidence gate passes |
| Shopify | Connected | 23 legacy/test records; all ARCHIVED; no PM commercial listing active |
| OneDrive | Connected | Evidence/asset source; no commercial publish implication |
| Figma | Connected | Design workspace access |
| monday.com | Connected | Workspace access |
| Amplitude | Project connected | Server adapter deployed; API key still required for event ingestion |
| Manus | Adapter deployed | Endpoint/token still required |
| WooCommerce | Adapter deployed | URL/credentials still required |

## Product release gate

A product cannot become commercially publishable without verified:

1. Product identity
2. SKU and/or GTIN
3. Exact PM-owned or authorized image
4. PM physical stock
5. Acquisition cost/provenance
6. Required authorization

Retailer pages are market/reference evidence only and do not replace PM stock or provenance evidence.

## Current product state

Airtable Product Master currently contains 73 records:

- 52 — Blocked: Identity
- 21 — Blocked: Image/Stock
- 0 — Publish-Ready

Physical Inventory Verification currently contains one DERMAELLE028 record with owner-reported quantity 60; verification remains Needs Evidence.

## External credentials

Never commit or paste API keys, tokens, consumer secrets, passwords, or private OAuth values into GitHub or chat.

Expected deployment-only credentials include:

- `AMPLITUDE_API_KEY`
- `MANUS_PRODUCTS_URL`
- `MANUS_API_TOKEN`
- `WOOCOMMERCE_URL`
- `WOOCOMMERCE_CONSUMER_KEY`
- `WOOCOMMERCE_CONSUMER_SECRET`

Missing credentials must keep the corresponding integration staged/disabled rather than fabricating a connection.

## Operating rule

Evidence -> Validation -> CI -> Commercial Gate -> Channel Sync -> Verification

No bulk publication, inventory mutation, or gate opening is allowed merely because a connector exists.
