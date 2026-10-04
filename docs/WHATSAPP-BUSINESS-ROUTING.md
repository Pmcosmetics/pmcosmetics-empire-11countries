# WhatsApp Business Routing — PM Cosmetics Hub

## Canonical operational number

- Primary/catalog: `01055655649` → https://wa.me/201055655649
- Catalog: https://wa.me/c/201055655649

## Current state

- **01055655649** is the single canonical public WhatsApp Business contact for PM COSMETICS HUB.
- The public storefront and reference catalog route customer CTAs to the same number.
- No WhatsApp Cloud API credentials are stored in GitHub.
- Meta Business Manager/WABA/API authentication is not claimed as completed through this ChatGPT session because no WhatsApp API connector is available here.

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
