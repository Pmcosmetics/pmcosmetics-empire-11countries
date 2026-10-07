# PM COSMETICS HUB API

## Control flow

Client / Operations UI → Supabase Auth → Empire API → Supabase/Airtable → Channel Adapter → External Channel

## Commercial gate

Product publication is evidence-gated.
- Product Evidence Gate: authoritative for SKU/product readiness
- Commercial Publish Gate: global live-write control
- Current Commercial Publish Gate: CLOSED
- No unverified product may be activated or bulk-published

## Public runtime endpoints

### Health & readiness
- GET /api/start

- GET /api/workspace/hub?action=status
- GET /api/workspace/hub?action=sync (read-only reconciliation; no external writes)

- GET /api/health
- GET /health
- GET /api/readiness
- GET /api/supabase/status
- GET /api/channel/status
- GET /api/brand
- GET /api/storefront
- GET /api/storefront/search?q=...

### Authentication
- GET /api/auth/config
- GET /api/auth/session

/api/auth/session requires Authorization: Bearer <Supabase access token> and performs server-side verification against Supabase Auth.
Missing or invalid tokens are rejected. The exact PM email allowlist is enforced server-side.

### Channel status
- GET /api/whatsapp/status
- GET /api/whatsapp/webhook
- POST /api/whatsapp/webhook
- GET /api/shopify/webhook
- POST /api/shopify/webhook
- GET /api/woocommerce/status
- GET /api/woocommerce/check
- GET /api/manus/status
- GET /api/amplitude/status

Webhook POST routes require provider signatures when configured.

## Product and intake endpoints

- GET /api/products
- GET /api/products/staging
- POST /api/products
- POST /api/products/batch/readiness
- POST /api/products/batch/publish
- POST /api/manus/import
- POST /api/manus/woocommerce/sync
- POST /api/woocommerce/sync

Write routes remain gate-controlled. Dry-run validation can be used without opening live publication.

## External publication endpoints

The following routes intentionally return a locked response while their channel/evidence gate is closed:
- POST /api/shopify/sync
- POST /api/noon/import
- POST /api/amazon/import
- POST /api/jumia/import
- POST /api/products

Locked publication routes return HTTP 503 with a machine-readable reason such as COMMERCIAL_PUBLISH_GATE_CLOSED, SHOPIFY_NOT_VERIFIED, AMAZON_NOT_VERIFIED, or JUMIA_NOT_VERIFIED.

## Operations dashboard

Authenticated operations UI: /ops/dashboard.html

Reads operational data from Supabase for catalog, inventory, currencies, orders, customer analytics and reporting.
The dashboard does not bypass the commercial/evidence gates.

## Security contract

- HTTPS-only deployment is required
- /api/auth is rate-limited
- Supabase service-role credentials must never be exposed to the browser
- Secrets belong in provider secret/environment storage
- Provider webhook signatures must be verified before processing
- No product or credential data is fabricated

See docs/SECURITY.md for the production security/compliance status.

## Protected administration/status routes

The following routes require a valid Supabase bearer token and are not public storefront APIs:
- GET /api/empire/registry
- GET /api/readiness
- GET /api/channel/status
- GET /api/supabase/status
- GET /api/manus/status
- GET /api/woocommerce/status
- GET /api/woocommerce/check
- GET /api/products/staging

Invalid or missing tokens return HTTP 401/403 according to the server-side auth result.


### Write-route authorization rule
All product-publish and sync write endpoints require a valid Supabase bearer token in addition to the commercial/evidence gates. The batch commercial gate defaults to CLOSED and can only be opened explicitly through server-side deployment configuration.
