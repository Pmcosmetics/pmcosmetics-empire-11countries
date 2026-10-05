# PM COSMETICS HUB — Release Batch #1 — 2026-10-05

**State:** PREPARED — NOT ACTIVATED  
**Global Commercial Publish Gate:** CLOSED  
**Batch size:** 1 product  
**Rule:** only Product Master records already marked Publish-Ready may enter this batch.

## Product in Batch

| SKU | GTIN | Product | PM Stock | Cost | Approved Price | Product Gate | Activation |
|---|---|---|---:|---:|---:|---|---|
| DERMAELLE007 | 6223007905060 | Dermaelle Hyalubalance Sebum Control Cleansing Gel 200ml | 48 | 260 EGP | 239 EGP | Publish-Ready | HOLD until release gates pass |

## Channel Scope

All 23 registered Empire channels are tracked in the batch register. A channel is **not activated** merely because it is listed.

| Channel | Current Registry Status | Batch Role | Activation |
|---|---|---|---|
| facebook | connected_verified | Candidate after sign-off | HOLD |
| shopify | connected_verified | Current controlled pilot | HOLD |
| instagram | oauth_pending | Pending authorization | HOLD |
| tiktok | oauth_pending | Pending authorization | HOLD |
| tiktok_shop | oauth_pending | Pending authorization | HOLD |
| amazon_sp | reference_staged_3218_oauth_pending | Pending authorization | HOLD |
| google_merchant | oauth_pending | Pending authorization | HOLD |
| woocommerce | manual_credentials_pending | Pending authorization | HOLD |
| salla | reference_staged_3218_api_token_pending | Pending authorization | HOLD |
| instashop | direct_integration_pending | Pending authorization | HOLD |
| etsy | reference_staged_3218_oauth_pending | Pending authorization | HOLD |
| temu | reference_staged_3218_authorization_pending | Pending authorization | HOLD |
| jumia | reference_staged_3218_seller_api_pending | Pending authorization | HOLD |
| talabat | reference_staged_3218_partner_api_pending | Pending authorization | HOLD |
| whatsapp_primary | public_identity_ready_credentials_pending | Pending authorization | HOLD |
| whatsapp_secondary | public_identity_ready_credentials_pending | Pending authorization | HOLD |
| take_app | reference_staged_3218_api_pending | Pending authorization | HOLD |
| olx_dubizzle_egypt | reference_staged_3218_seller_connection_pending | Pending authorization | HOLD |
| snapchat | oauth_pending | Pending authorization | HOLD |
| telegram | bot_credentials_pending | Pending authorization | HOLD |
| noon | reference_staged_3218_credentials_pending | Pending authorization | HOLD |
| kenz | reference_staged_3218_unverified_marketplace | Pending authorization | HOLD |
| knooz | reference_staged_3218_unverified_marketplace | Pending authorization | HOLD |

## Mandatory conditions before activation

1. Product evidence is complete: exact PM identity, SKU, GTIN, exact image, stock, cost/provenance, authorization and QA.
2. evidenceVerified=true and publishable=true are satisfied by the authoritative Product Evidence Gate.
3. The channel is authorized and its provider status is independently verified.
4. The channel exposes **exactly one** pilot product: DERMAELLE007.
5. Catalog mandatory fields are 100% complete.
6. Sync test passes with **0 blocking errors**.
7. Reconciliation is exact: SKU/GTIN 1:1, price drift **0 EGP**, stock drift before first order **0**.
8. Rollback and recovery tests both PASS.
9. Owner + Integration Engineer + QA sign-off is recorded.
10. The **global Commercial Publish Gate is explicitly OPEN** for this release.

## Release controls

**DO:** publish only DERMAELLE007 after all required gates pass.
**DO NOT:** add any of the remaining 72 Product Master records to this batch, invent missing SKU/GTIN/stock/cost/image evidence, or bypass channel authorization.

## Post-publish verification

Immediately reconcile SKU, GTIN, title, image, price, stock, publication status and listing/channel IDs back to Product Master. Any critical discrepancy triggers HOLD + rollback.

**Out of scope:** 52 Blocked — Identity + 20 Blocked — Image/Stock.
