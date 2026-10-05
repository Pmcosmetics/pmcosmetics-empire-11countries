# PM COSMETICS — Measurable Multi-Channel Acceptance Criteria

Date: 2026-10-05
Controlled pilot: DERMAELLE007
GTIN: 6223007905060
PM stock baseline: 48
PM-approved pilot retail price: 239 EGP
Global Commercial Publish Gate: CLOSED

## Universal rules

A channel is ACCEPTED only when every P0 criterion passes and evidence is attached. Any identity mismatch, unauthorized write, unexplained stock/price drift, credential failure, consent/policy failure, or rollback failure = FAIL / CHANNEL HOLD.

Evidence must include timestamp, owner, test ID, provider response/status, and a reproducible artifact reference.

| Channel | Authorization | Catalog | Sync | Reconciliation | Rollback | Final sign-off |
|---|---|---|---|---|---|---|
| Instagram Shop | Meta Business Portfolio + Facebook Page + Instagram Professional account + Shopify Facebook & Instagram by Meta connected; provider status verified | DERMAELLE007 only; product identity, image and category complete | Catalog sync 100% successful for pilot; 0 blocking errors; product status visible in intended Meta surface | SKU/GTIN/identity exact; price 239 EGP; stock 48 before first order; no non-pilot product exposure | Disable channel/catalog publication and restore pilot state within 15 min of incident start; no unintended product remains active | Meta Owner + Integration Engineer sign after all tests PASS and Meta/Shopify status evidence attached. Shopify states the Meta channel syncs products to Facebook/Instagram catalogs and is subject to store eligibility. citeturn886403search0turn886403search9 |
| Etsy | Seller App authorization complete; OAuth 2.0 token active with required scopes; API key configured; HTTPS callback/state/PKCE checks PASS | Draft listing contains exact product identity, at least one image, quantity, title, description, price, taxonomy and shipping/readiness data; publish only after review | Create/update/read listing + inventory test PASS; order read test PASS; 0 API write errors | SKU/GTIN/identity exact; quantity 48 baseline; approved price matches; listing ID maps 1:1 to PM | Deactivate/delete only the pilot listing as needed; revoke/rotate credentials if auth compromised; recovery test PASS | Etsy Owner + Integration Engineer sign after listing/inventory/order evidence is attached. Etsy requires API key + OAuth for write operations; active physical listings require image and required listing fields. citeturn560825search1turn560825search0 |
| WhatsApp Business API | WABA + production phone + API authorization verified; Phone Number ID exact | Only DERMAELLE007 in controlled commerce path; product identity exact | GET webhook verification PASS; POST signature validation PASS; inbound and outbound test PASS; approved templates send successfully | WABA/phone/message/order references reconcile; opt-in/opt-out controls PASS; no unauthorized recipients | Outbound disabled and credentials rotated/revoked on incident; recovery test PASS with evidence | Meta/WhatsApp Owner + Integration Engineer + QA sign. Meta's Cloud API requires a Meta business portfolio, WABA and business phone; WABA subscription is required for webhook events. citeturn423552search5turn423552search4 |
| Jumia | Egypt Seller/Vendor Center account + API authorization + seller/shop identifier verified | DERMAELLE007 mapped to correct Egypt category; mandatory attributes evidence-backed; image and GTIN exact | Product/QC feed completes successfully; stock update to 48 and price update to 239 EGP both confirmed; order read test PASS | Seller SKU/GTIN/identity/price/stock match PM; 0 unexplained feed or inventory drift | Stop channel writes; deactivate/revert only pilot listing; restore PM source-of-truth; recovery/reconciliation PASS | Jumia Owner + Integration Engineer + QA sign after provider/QC evidence is attached. |
| Amazon | Seller Central Egypt verified; SP-API developer/app registered; seller authorization/self-authorization complete; LWA refresh token active | Exact GTIN resolution without unintended duplicate; seller SKU DERMAELLE007; mandatory product attributes and image complete | Listing write/read PASS; inventory 48; price 239 EGP; image validation PASS; order read/sandbox-or-live controlled test PASS | Amazon SKU/GTIN/identity/price/stock exact; 0 unintended catalog/listing changes | Stop writes; deactivate/revert pilot; revoke/rotate credentials if required; restore and re-test | Amazon Owner + Integration Engineer + QA sign. Amazon documents LWA credentials + seller authorization for SP-API and requires registration/appropriate roles; private seller apps require a Professional selling account. citeturn423552search0turn423552search9 |

## Numeric PASS thresholds

- Pilot products exposed: exactly 1
- Pilot SKU mapping: exactly 1 PM record ↔ 1 channel listing
- GTIN match: 100%
- Mandatory field completion for the channel taxonomy: 100%
- Blocking provider errors after final sync: 0
- Unintended catalog items published: 0
- Price drift from approved pilot price: 0 EGP
- Stock drift before first order: 0 units
- Unauthorized outbound WhatsApp recipients: 0
- Failed signature checks incorrectly accepted: 0
- Rollback recovery: PASS on first controlled test

## Final sign-off record

The final sign-off package must contain:

1. Authorization evidence.
2. Catalog/listing snapshot.
3. Sync test results.
4. Reconciliation result.
5. Rollback test evidence.
6. Named owner and timestamp.
7. Final status: PASS or FAIL.

A channel becomes **PRODUCTION PILOT ACCEPTED** only after the owner, integration engineer and QA have signed the evidence package. The global Commercial Publish Gate remains CLOSED for all products other than the explicitly approved pilot.

## Official Evidence Scope — All Empire Channels

Official evidence source declared by PM COSMETICS:
https://drive.google.com/drive/folders/1eTlPxA3hBxnNO7aR6qFo70qqRKCjpriY

This source applies to **all channels in the Empire registry**, not only the five pilot channels.

Registered channel scope:
- facebook
- shopify
- instagram
- tiktok
- tiktok_shop
- amazon_sp
- google_merchant
- woocommerce
- salla
- instashop
- etsy
- temu
- jumia
- talabat
- whatsapp_primary
- whatsapp_secondary
- take_app
- olx_dubizzle_egypt
- snapchat
- telegram
- noon
- kenz
- knooz

The same acceptance model applies channel-by-channel:
**Authorization → Catalog/Content → Sync → Reconciliation → Rollback → Final Sign-off**.

A channel remains **Pending Verification** until the underlying official evidence can be read and mapped to its test IDs. Presence of a link or account name alone is not treated as proof of successful connection.
