# Salla Merchant API integration

## Current state

Salla is registered as a planned sales channel, but this repository does not consider it connected until a live authorized API call succeeds. The production API must have `SALLA_ACCESS_TOKEN` set in Railway's secret/environment settings; never commit or paste the token into chat.

- Required scope: `products.read_write`
- Connection check: authenticated read-only request to `GET /admin/v2/products?page=1&per_page=1&format=light`
- Product inserts are drafted as `hidden`; this adapter never intentionally activates a customer-visible listing.
- Import route requires authenticated Empire access, live Salla authorization, exact target/store currency match, authoritative Product Master evidence, and all commercial gates open.
- Exact SKU matches already present in Salla are skipped rather than duplicated or overwritten.
- The first batch is limited to 25 products. Validate a single pilot first, then reconcile SKU, GTIN, price/currency, image, stock and Salla product ID before larger batches.
- The reference catalog from AlFouad is taxonomy/reference data only, not proof of PM-owned stock, image rights, cost or target-market pricing.

## Runtime routes

- `GET /api/salla/status` — protected configuration summary; never returns tokens.
- `GET /api/salla/check` — protected live, read-only connection check.
- `POST /api/salla/import` — protected evidence-gated import. Request JSON:
  ```json
  {
    "dryRun": true,
    "targetCurrency": "EGP",
    "products": [{"sku": "DERMAELLE007"}]
  }
  ```
  Omitting products selects the currently recorded Publish-Ready SKUs. Dry-run is the default. Real writes require `dryRun: false`, a confirmed store currency equal to the explicit target currency, valid evidence and all production gates open. Products are created hidden.

## Authorization notes

Create/authorize the app in Salla Partners and grant `products.read_write`. Store any token only in Railway secret variables, not in GitHub or a spreadsheet. Salla's OAuth access tokens expire after 14 days; refresh tokens are single-use and rotate, so production automation needs a durable encrypted token store with serialized refresh before automatic renewal can be claimed. This adapter intentionally does not pretend token refresh is complete.

Official references:
- https://docs.salla.dev/421118m0
- https://docs.salla.dev/5394168e0
- https://docs.salla.dev/5394167e0
- https://docs.salla.dev/5394178e0
