# WhatsApp Business Routing — PM Cosmetics Hub

## Canonical operational numbers

- Primary/catalog: `01055655649` → https://wa.me/201055655649
- Secondary/direct backup: `01203151461` → https://wa.me/201203151461
- Catalog: https://wa.me/c/201055655649

## Current state

- Both numbers are already present in the PM Cosmetics Hub Master Registry as verified business identities.
- The canonical website previously routed every order CTA only to `01055655649`.
- This change adds explicit primary + secondary contact links to the canonical website footer and keeps the existing catalog URL on the primary number.
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

- Catalog CTA → primary `01055655649`
- Direct/backup contact → secondary `01203151461`
- Product-specific deep links may target either number only after the product is evidence-gated.
- Do not initiate outbound campaigns without approved templates/consent and current WhatsApp Business policy compliance.