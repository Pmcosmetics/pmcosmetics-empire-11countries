# PM COSMETICS HUB — Amazon.eg Listing Execution Plan
Generated: 2026-10-09 (Asia/Baghdad)

## Current verified state
- Product Master snapshot: 73 records.
- Evidence snapshot classifies 1 Publish-Ready candidate, 52 Blocked — Identity, and 20 Blocked — Image/Stock. Archived status is tracked separately in the source record and is not a new additive bucket.
- Global commercial publication gate: CLOSED; bulk publication is disabled.
- Windsor.ai lists an Amazon SP-API action for updating an existing listing, but no Amazon SP-API account is currently connected in the linked workspace.
- Therefore this file is a staging plan only. It is not proof of a live Amazon listing or a submission to Amazon.

## First candidate
- PM SKU / proposed Seller SKU: DERMAELLE007
- Product: Dermaelle Hyalubalance Sebum Control Cleansing Gel 200ml
- GTIN: 6223007905060
- PM stock evidence: 48 units
- Acquisition cost: EGP 260 (not a retail offer price)
- Authorization status: Verified in canonical gate record
- QA: Passed 2026-10-04
- Image evidence: Connected OneDrive QA record is referenced by the canonical Product Evidence Gate; direct public-image accessibility/readback has not been independently verified in this session.
- Amazon offer price and Amazon offer quantity: intentionally blank until confirmed by the owner.
- Seller Central SKU/ASIN match, category/product-type and brand restriction checks: not yet completed.

## Execution order
1. Connect/authorize the Amazon.eg Selling Partner account with the appropriate listing permissions.
2. Search Seller Central by GTIN and title; use the existing ASIN when the exact product and variant match. Verify that the Seller SKU is available and does not collide with another SKU.
3. Confirm the Amazon browse category/product type and whether the brand/category requires approval.
4. Validate the product's original packaging, exact title, manufacturer/brand, net quantity, ingredients, directions, warnings, and authentic product images. Do not invent benefits or ingredients.
5. Verify image access and prepare the required main image according to Amazon.eg image rules (white background, product clearly filling the frame, minimum technical size per Seller Central's image requirements).
6. Enter the approved EGP offer price and allocate an offer quantity from verified inventory. Do not substitute cost for sale price and do not expose all physical stock by default.
7. Use the current category-specific Amazon Seller Central listing template, if a flat file is required.
8. Submit only after candidate-level evidence review and required approvals. Then retrieve the processing/listing status and verify the live detail page before marking the item as published.

## Sources
- Amazon.eg listing guide: https://sell.amazon.eg/content/listing-guide
- Amazon.eg image guidance (sign-in may be required): https://sellercentral.amazon.eg/help/hub/reference/external/G200216080?locale=zh-CN
- Amazon.eg general product/listing guidance: https://sellercentral.amazon.eg/help/hub/reference/external/G200421970?locale=en-SG
- Canonical Product Evidence Gate: https://github.com/Pmcosmetics/pmcosmetics-empire-11countries/blob/main/config/product-evidence-gate-2026-10-05.json
- Product Master snapshot: https://github.com/Pmcosmetics/pmcosmetics-empire-11countries/blob/main/data/products/staging-evidence.json

## Safety rules
- No synthetic GTIN/EAN/UPC, no guessed offer price, no guessed stock and no copied retailer image treated as PM-owned evidence.
- The retailer-reference URLs support identity/variant comparison only; they do not prove PM inventory or image ownership.
- Keep all blocked records excluded from upload batches until evidence is remediated.
