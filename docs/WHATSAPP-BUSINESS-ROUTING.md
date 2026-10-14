# WhatsApp Business Routing — PM Cosmetics Hub

## Canonical contact

- Primary phone: `01055655649` / `+20 10 5565 5649`
- Direct WhatsApp: https://wa.me/201055655649
- Catalog: https://wa.me/c/201055655649

## Current policy

- `01055655649` is the single canonical public contact number for PM COSMETICS HUB.
- All public-facing contact and WhatsApp CTAs in the storefront, catalog, reference catalog, and business profile should use this number and its matching links only.
- The brand identity and publication manifest keep legacy secondary/tertiary compatibility fields mapped to the same canonical destination; they do not represent separate public contact numbers.
- Legacy phone references may remain in archived historical documents or audit evidence, but must not be exposed as current public CTAs.
- Customer phone fields in orders, CRM records, and customer profiles are customer data and must never be changed by a global phone-number replacement.
- No WhatsApp Cloud API credentials are stored in GitHub.
- Meta Business Manager/WABA/API authentication is not claimed as completed through this ChatGPT session because no WhatsApp API connector is available here.
- The Google Business Profile target phone is set in the project registry to `01055655649`, but the external provider-side setting still requires an authorized update and live verification.

## Cloud API handoff

When Meta/WhatsApp Business Platform access is available, keep credentials only in Railway secrets. Expected server-side variables:
- `WHATSAPP_BUSINESS_ACCESS_TOKEN`
- `WHATSAPP_BUSINESS_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_VERIFY_TOKEN`
- `WHATSAPP_WEBHOOK_SECRET`

The legacy webhook implementation is archived under `archive/legacy-Pm/services/whatsapp-webhook`; it is not the canonical production runtime.

## Routing policy

- Catalog CTA → `01055655649`
- Product-specific deep links may target only the canonical number after the product is evidence-gated.
- Do not initiate outbound campaigns without approved templates/consent and current WhatsApp Business policy compliance.

## Cloud API webhook endpoint

The production API exposes:
- GET /api/whatsapp/webhook — Meta verification handshake
- POST /api/whatsapp/webhook — signed webhook delivery endpoint
- GET /api/whatsapp/status — configuration state without exposing secrets

Production callback URL:

https://pmcosmetics-empire-11countries-production.up.railway.app/api/whatsapp/webhook

Required Railway secrets:
- WHATSAPP_BUSINESS_ACCESS_TOKEN
- WHATSAPP_BUSINESS_PHONE_NUMBER_ID
- WHATSAPP_BUSINESS_VERIFY_TOKEN
- WHATSAPP_WEBHOOK_SECRET

The webhook validates the Meta verification token on GET and X-Hub-Signature-256 on POST. It does not persist webhook payloads or send outbound messages automatically.

Cloud API/WABA is not claimed as connected until Meta-side WABA subscription and phone-number configuration are completed and verified.
