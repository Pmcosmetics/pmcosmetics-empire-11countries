# PM COSMETICS HUB — Firecrawl Live Source Audit

**Audit date:** 2026-10-10  
**Collector:** Firecrawl  
**Purpose:** Verify whether the reference store can be treated as the complete, publish-ready PM product catalog.  
**Result:** Reference-only; not publish-ready.

## Live collection observation

Source collection: https://alfouadpharmacies.com/en/collections/all

The live page returned:
- **4,978 products** shown by the source collection.
- **3,480 in stock** and **1,498 out of stock** according to its availability filter.
- Displayed price range reached **EGP 18,150**.
- The collection includes many departments outside cosmetics, including testing supplies, vitamins, baby milk, and other pharmacy products. Product-level category review is required before importing anything into a cosmetics-only catalog.

This differs from the prior repository reference snapshot of **3,218 unique products / 3,479 category rows**. Do not overwrite the existing Product Master counts or treat either number as PM-owned inventory without a paginated, SKU-level reconciliation.

## Sample product extraction

Source product: https://alfouadpharmacies.com/en/products/kerastase-densifique-masque-densite-hair-mask-200ml

Firecrawl could read the following reference fields on the page:
- Title: Kérastase Densifique Masque Densité Hair Mask 200ml
- Vendor/category: Kerastase / Hair Care
- Reference price: EGP 2,500
- Availability shown: sold out / out of stock
- Two image assets were directly exposed in the page markup:
  - https://alfouadpharmacies.com/cdn/shop/files/Kerastase_Densifique_Masque_Densite_Hair_Mask_200ml.webp?v=1786365805&width=1946
  - https://alfouadpharmacies.com/cdn/shop/files/Kerastase_Densifique_Masque_Densite_Hair_Mask_200ml_hand_model.webp?v=1786365805&width=1946
- The page contains a product description and usage information, but that text and those images remain third-party reference content.

**Important:** These data prove only what the reference page displayed during the scan. They do not prove PM ownership, permission to reuse imagery/text, acquisition cost, PM stock, exact SKU/GTIN, or permission to publish on any marketplace.

## Reconciliation and safe-use rules

1. Treat Firecrawl output as source discovery and reference extraction, not automatic Product Master intake.
2. Do not transfer reference retail prices into PM pricing, and do not mark stock available when the source says sold out.
3. Before any PM commercial listing, verify PM-owned identity/SKU/GTIN, usable image rights, real PM inventory, acquisition cost/provenance, QA, approved selling price and channel eligibility.
4. Exclude medicines, supplements, test supplies, baby milk and non-cosmetics from this cosmetics catalog unless explicitly in scope and separately approved.
5. Etsy remains policy-gated and seller authorization is still required; do not bulk-publish branded retail cosmetics from this reference source.

## Audit limitation

This was a live page-level scan plus a single product detail sample, not an exhaustive crawl or a 4,978-product extraction. The Firecrawl account reported a low credit balance. No product listings or store inventory were changed by this audit.
