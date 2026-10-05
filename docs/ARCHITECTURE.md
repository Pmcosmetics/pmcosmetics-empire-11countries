# PM COSMETICS HUB — Architecture

## 1. System of record

The canonical commerce control plane is:

**Product Evidence → Airtable Evidence/Registry → Supabase Product Master → Channel Adapter → External Channel → Verification**

The authoritative commercial rule is **Publish-Ready + evidenceVerified**. Reference catalogs such as AlFouad are isolated as taxonomy/UX references and never become PM inventory automatically.

## 2. Runtime layers

### Identity
- Supabase Auth
- Server-side bearer-token verification through /auth/v1/user
- Exact allowlist: shukrypeter79@gmail.com and shukrypeter102@gmail.com
- Google OAuth and passwordless email-link UI
- Google Provider Client ID/Secret remain an external Supabase setup dependency

### Application
- Node.js 20+ / Express
- Helmet security headers
- HTTPS enforcement when HTTPS_ONLY=true
- Auth endpoint rate limiting
- JSON/body validation and signed webhook verification
- Commercial write gate defaults to CLOSED

### Data
- Airtable: operational registry, tasks, evidence workflow
- Supabase: Product Master, inventory, pricing, orders, customers, commerce channels, reporting
- Shopify: external commerce catalog and controlled pilot
- Notion: command-center/audit documentation; not the primary transactional database

### Operations
Authenticated Operations Dashboard: /ops/dashboard.html

It reads Product Catalog, Inventory, Multi-Currency Pricing, Orders, Customer Analytics and Reporting Dashboard.

The dashboard is read-oriented; external publication remains governed by the commercial/evidence gates.

## 3. Commerce channels

Current registry includes Shopify, Amazon SP-API, Etsy, Jumia, WhatsApp Business, Instagram, TikTok, TikTok Shop, Google Merchant, WooCommerce, Noon, Salla, InstaShop, Talabat and other staged/conditional channels.

Only provider-authenticated channels are treated as connected. A configured registry entry is not proof of seller authorization.

## 4. Currency policy

The connected Shopify Egypt store is verified as EGP.

Rules:
- Keep Egyptian retail prices in EGP
- Never write an EGP numeric value into a USD-priced field
- Non-EGP channels require an explicit target currency and verified conversion policy
- Zero/placeholder prices are blocked from commercial sync

## 5. Publication gate

There are two layers:

1. Product Evidence Gate — verifies identity, SKU/GTIN, image, stock, cost/provenance and authorization where applicable
2. Commercial Publish Gate — global switch controlling live external writes

Current state:
- Global Commercial Publish Gate: CLOSED
- Current Publish-Ready SKU: DERMAELLE007
- Bulk publication: DISABLED

## 6. Webhooks

Shopify and WhatsApp webhook endpoints validate cryptographic signatures before accepting deliveries.

WhatsApp routes:
- GET /api/whatsapp/webhook
- POST /api/whatsapp/webhook

Production callback:
https://pmcosmetics-empire-11countries-production.up.railway.app/api/whatsapp/webhook

## 7. Deployment topology

### Railway
Canonical production API/runtime: pmcosmetics-empire-11countries-production.up.railway.app

### Supabase
Project reference: rhozehqlpnmzmknlpmvf
Observed database region: eu-west-1

### Shopify
Connected Egypt store: pmcosmetics-lgdc2mrf.myshopify.com
Live shop currency: EGP

### GitHub
Canonical repository: Pmcosmetics/pmcosmetics-empire-11countries

## 8. Security boundaries

Secrets are environment/secret-store values only. They must not be committed to Git, embedded in client code, logged, or sent through chat.

Core commerce tables use Supabase RLS and authenticated/admin policies.

Compliance status is deliberately not represented as a blanket certification:
- GDPR: not signed off
- PCI DSS: not signed off
- Egypt PDPL: conditional/action required
- Saudi PDPL: transfer review required
- UAE PDPL: transfer review required

See docs/SECURITY.md for the live audit record.