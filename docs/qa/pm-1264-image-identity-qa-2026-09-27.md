# PM-1264 Image Identity QA — 2026-09-27

## Result

Two rows in the PM-1264 source workbook were marked image-ready, but direct inspection of their embedded image assets found product-image mismatches.

| Source row | Product | Retailer SKU | Retailer GTIN | QA result |
|---:|---|---|---|---|
| 17 | SVR PALPEBRAL MASCARA 9ML | 103970 | 3662361001828 | BLOCKED_IMAGE_MISMATCH |
| 18 | SVR XERIAL 10 LAIT 200ML | 103973 | 3662361002412 | BLOCKED_IMAGE_MISMATCH |

## Control decision

- The two embedded assets are **not valid exact-product image evidence**.
- They must not be propagated to Shopify, Noon, Amazon, Jumia, or other sales channels.
- Retailer identity data remains reference-only and does not prove PM ownership, stock, or cost.
- PM stock, PM cost, and PM-owned exact image evidence remain required.
- Commercial publication remains **CLOSED**.

## Source provenance

- Source: PM_1264_Staging_Gate.xlsx
- Source rows: 1,264
- Embedded images detected: 24
- Image-ready rows: 24
- Failed image identity QA: 2
- Remaining image-ready assets requiring identity QA: 22

This QA record exists to prevent source-level “image ready” status from being mistaken for verified exact-product image evidence.
