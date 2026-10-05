# PM COSMETICS HUB — Five-Channel Activation Wave — 2026-10-05

**Scope:** Instagram Shop, Etsy, WhatsApp Business API, Jumia, Amazon  
**Pilot:** DERMAELLE007 / GTIN 6223007905060 / stock 48 / 239 EGP  
**Commercial Publish Gate:** CLOSED

| Channel | Current state | Immediate action | Exit gate |
|---|---|---|---|
| Instagram Shop | READY_FOR_ACCOUNT_AUTHORIZATION | Install/connect Shopify Facebook & Instagram by Meta; connect Meta Business/Page/Instagram; verify eligibility and catalog sync | Auth + eligibility + catalog + reconciliation + rollback + sign-off |
| Etsy | SELLER_APP_AUTHORIZATION_PENDING | Register Seller App, OAuth 2.0/PKCE, configure HTTPS callback/scopes | Auth + draft listing + sync + reconciliation + rollback + sign-off |
| WhatsApp Business API | CREDENTIALS_PENDING | Configure WABA/Phone ID/access token/webhook secrets in secret storage; verify webhook/signature/templates | Auth + webhook + messaging/consent + reconciliation + rollback + sign-off |
| Jumia | SELLER_CENTER_API_AUTHORIZATION_PENDING | Complete Egypt Seller Center/API authorization and seller/shop mapping | Auth + product/QC feed + inventory/orders + reconciliation + rollback + sign-off |
| Amazon | SELLER_CENTRAL_AUTHORIZATION_PENDING | Complete Egypt Seller Central/SP-API app + seller authorization + LWA credentials + compliance | Auth + listing/inventory + reconciliation + rollback + sign-off |

## Guardrails
- Only DERMAELLE007 is in the pilot scope.
- Do not publish any of the 72 non-ready Product Master records.
- Never put provider credentials/secrets in Git.
- Any critical failure produces CHANNEL HOLD and rollback.
- Global Commercial Publish Gate stays CLOSED until the approved release package passes.

