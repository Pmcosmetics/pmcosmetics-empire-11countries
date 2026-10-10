# PM COSMETICS HUB — Etsy Catalog Eligibility and Publication Gate

**Reviewed:** 2026-10-10  
**Channel status:** HOLD — no bulk Etsy publication  
**Commercial Publish Gate:** CLOSED

## Catalog facts verified in GitHub

- The reference source identifies **3,218 unique products** across **3,479 category rows**. Category rows are not 3,479 separate, verified sale-ready products.
- The reference catalog is explicitly marked `referenceOnly`; it is a taxonomy/merchandising reference, not proof of PM-owned product identity, images, stock, acquisition cost, or publication permission.
- The recorded Product Master evidence snapshot contains 73 records: 1 Publish-Ready and 72 blocked (52 Identity, 20 Image/Stock). The latest repository reconciliation dated 2026-10-09 says Shopify has 2,612 product records but 0 active; DERMAELLE007 remains Draft. This does not authorize Etsy publication.
- The available Etsy app actions in this session search and display marketplace listings; they do not create or publish listings in the user's seller shop. No seller-shop write was executed.

## Why bulk Etsy publication is on hold

Etsy's current [Seller Policy](https://www.etsy.com/legal/sellers/) states that dropshipping and reselling are not allowed except for specific permitted cases, and asks sellers to use their own photographs or video rather than images used by other sellers/sites. The standard PM catalog appears to consist largely of ready-to-use, branded retail cosmetics; it must not be bulk-listed on Etsy as an ordinary resale catalog without item-level eligibility review.

Etsy's Open API also requires an API key and a seller-authorized OAuth token with the `listings_w` scope for listing-write operations. This workspace's Etsy connector does not expose those seller-write operations, and the repository currently records seller authorization as pending. See the [official Etsy Listings Tutorial](https://developers.etsy.com/documentation/tutorials/listings/) and [Authentication Guide](https://developers.etsy.com/documentation/essentials/authentication/).

## Safe next steps

1. Keep the full commercial cosmetics catalog in the PM master and route eligible verified resale products to properly authorized retail channels such as Shopify, Salla, Amazon, Jumia, or Noon, subject to each channel's rules and readiness checks.
2. Build a separate Etsy candidate set only for products individually confirmed to qualify under Etsy's Creativity Standards and Seller Policy. Do not infer eligibility from a brand, image, description, or reference-shop listing.
3. For every Etsy candidate, verify item eligibility, PM identity/SKU, allowed image rights, accurate description, price in the shop currency, quantity, shipping/processing profiles, ingredient/legal compliance, and the seller's authorization.
4. If seller API access is later available, create **drafts first**, read them back, reconcile them to the Product Master, and activate only after policy, evidence, and approval checks pass.

## Required invariant

`commercialPublishGate=CLOSED`, `publishableNow=0` for Etsy bulk catalog import until the policy-eligible candidate set and seller authorization are independently verified. No listings have been claimed or marked live by this document.
