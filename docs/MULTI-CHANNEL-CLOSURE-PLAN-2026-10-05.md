# PM COSMETICS — Multi-Channel Closure Plan

Date: 2026-10-05
Source of truth: Empire Product Master / Evidence Gate
Global Commercial Publish Gate: CLOSED
Controlled product: DERMAELLE007

| Priority | Channel | Current repository status | Owner | Target | Closure criterion |
|---|---|---|---|---|---|
| P0 | Instagram Shop Setup | oauth_pending | Meta Owner + Integration Engineer | 2026-10-06 | Meta Business Portfolio + Facebook Page + Instagram Professional connected; Shopify Facebook & Instagram by Meta connected; catalog sync PASS; DERMAELLE007 only in pilot; tagging available after Meta approval |
| P0 | WhatsApp Business API | public_identity_ready_credentials_pending | Meta/WhatsApp Owner + Integration Engineer | 2026-10-06 | WABA/phone/API authorization verified; production secrets in Railway only; GET/POST webhook tests PASS; inbound/outbound messaging PASS; templates + opt-in/out + escalation PASS; rollback evidence recorded |
| P1 | Amazon Integration | reference_staged_3218_oauth_pending | Amazon Owner + Integration Engineer | 2026-10-07 | Seller Central + SP-API/LWA authorization verified; exact GTIN/SKU mapping; listing, image, price 239 EGP and stock 48 reconcile; order-read test PASS; no duplicate identity |
| P1 | Jumia Integration | reference_staged_3218_seller_api_pending | Jumia Owner + Integration Engineer | 2026-10-07 | Seller/Vendor Center API authorization verified; exact category + mandatory attributes resolved; QC PASS; price 239 EGP and stock 48 reconcile; order-read test PASS |
| P2 | Etsy Listing Integration | reference_staged_3218_oauth_pending | Etsy Owner + Integration Engineer | 2026-10-08 | Seller App + OAuth authorization verified; exact listing identity; draft-first listing test PASS; inventory/order sync PASS; DERMAELLE007 only |

## Execution gates
1. Complete Meta/WhatsApp account authorization dependencies first.
2. Run read/resolve tests before any channel write.
3. Publish or activate DERMAELLE007 only after product-level evidence remains Publish-Ready.
4. Reconcile identity, price, image, stock and order paths after every write.
5. Keep all other products blocked.
6. Keep Commercial Publish Gate CLOSED globally.

## Stop conditions
Any identity mismatch, GTIN conflict, credential problem, unauthorized messaging, consent failure, unexpected price/stock change, image/policy rejection, or reconciliation failure => channel HOLD and rollback.

## Evidence required for closure
Authorization evidence + provider status + API/webhook test results + listing/catalog evidence + price/stock reconciliation + order/event evidence + rollback record.
