# PM COSMETICS HUB — Reference Catalog Batch Export

**Final export verified:** 2026-10-10  
**Workflow run:** https://github.com/Pmcosmetics/pmcosmetics-empire-11countries/actions/runs/38021135645  
**Download artifact:** https://github.com/Pmcosmetics/pmcosmetics-empire-11countries/actions/runs/38021135645/artifacts/11658102576  
**Artifact name:** `pm-cosmetics-reference-review-batches`  
**Expiry:** 2026-10-24 03:36 UTC (14-day artifact retention)

## Verified export totals

- Reference category rows read: **3,479 / 3,479**.
- Duplicate rows removed across categories: **261**.
- Unique reference products exported: **3,218 / 3,218**.
- CSV output: **13 batches**, up to 250 records per file.
- Workflow result: **SUCCESS**.
- Artifact upload: **SUCCESS**, 342,068 bytes compressed.
- Source category counts all matched the repository index:
  - Skin care: 1,178
  - Hair care: 992
  - Body care: 921
  - Perfumes: 178
  - Kids care: 157
  - Korean products: 53

## Field completeness within the stored reference snapshot

| Field | Missing records |
|---|---:|
| Name | 0 |
| Brand | 0 |
| Reference EGP price | 0 |
| Reference image URL | 0 |
| Reference description | 0 |
| Source URL | 0 |
| Source SKU | 73 |

The SKU field is the source/reference SKU. It is **not** proof that a valid PM SKU exists.

## Important source freshness limitation

The export was generated from the existing GitHub snapshot under `data/references/alfouad-cosmetics-catalog/`, generated 2026-10-02. It is a complete export of that stored snapshot, **not a fresh live recrawl** of AlFouad Pharmacies. Firecrawl currently reports a negative remaining credit balance, so no further live scrape was performed.

A separate live Firecrawl sample on 2026-10-10 showed that the current collection page displays 4,978 products and different availability totals; do not treat that live collection count as reconciled with this older snapshot. Refresh the source before treating prices or availability as current.

## Publication and evidence safeguards

Every output row is marked `reference_only=true`, `publish_status=HOLD — REFERENCE ONLY`, and requires scope review. PM identity, PM stock, acquisition cost/provenance, and image reuse rights are not verified by this export. The source's retail price is not a PM-approved selling price, and source availability is not PM stock.

**Publishable now from this export: 0.** No Etsy, Shopify, Salla, Amazon, Noon, or other marketplace listings were created or activated by this workflow.

## Repeatable exporter

- Script: [`scripts/export-reference-review-batches.mjs`](https://github.com/Pmcosmetics/pmcosmetics-empire-11countries/blob/main/scripts/export-reference-review-batches.mjs)
- Workflow: [`.github/workflows/export-reference-review-batches.yml`](https://github.com/Pmcosmetics/pmcosmetics-empire-11countries/blob/main/.github/workflows/export-reference-review-batches.yml)
- The workflow is manually runnable and reruns on relevant catalog/script changes.
