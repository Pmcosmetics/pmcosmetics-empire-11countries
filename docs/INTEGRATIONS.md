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
| Shopify | Connected | Store `pmcosmetics-lgdc2mrf.myshopify.com`; 140 draft products observed; commercial publication remains gated |
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

Current evidence/quarantine snapshot contains 73 blocked records:

- 52 — Blocked: Identity
- 21 — Blocked: Image/Stock
- Publish-ready products remain gated until evidence validation is complete

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
