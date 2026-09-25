# PM Cosmetics Hub API

## Control flow

ChatGPT -> Products OS -> Supabase -> Shopify -> Noon -> Amazon -> Jumia

## Gate

All product intake and channel publication endpoints remain CLOSED until source evidence, Supabase availability, credentials, and channel verification are confirmed.

## Endpoints

- GET /api/health
- POST /api/chat
- GET /api/products
- POST /api/products
- POST /api/shopify/sync
- POST /api/noon/import
- POST /api/amazon/import
- POST /api/jumia/import

Locked endpoints return HTTP 503 with a machine-readable reason. No product or credential data is fabricated.
