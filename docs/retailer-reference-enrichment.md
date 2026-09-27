# Retailer Reference Enrichment

This stage accelerates product-data completion without treating a public retailer as proof of PM Cosmetics inventory.

## Matching precedence

1. Exact GTIN
2. Exact source-specific retailer SKU (never copied into PM canonical SKU)
3. Exact Brand + Product Name + Size/Variant
4. A single same-brand/same-size candidate is flagged for review, not publication
5. Multiple candidates or no candidates remain unresolved

## Output policy

The matcher preserves PM source values and adds a separate `enrichment` object containing retailer-reference fields such as public price, description, image URL and retailer SKU.

The script never invents:

- PM canonical SKU
- PM stock or quantity
- PM acquisition cost
- supplier
- batch/expiry
- PM ownership

A product can only be emitted as `Publish-Ready` when the PM input already carries canonical SKU + GTIN, verified PM-stock evidence, PM image evidence, verified cost, and an explicit `evidenceValidated` flag. Retailer availability alone never satisfies that gate.

## Usage

```bash
node scripts/enrich-retailer-reference.mjs <pm-source.json> <reference.json> <output.json>
```

The PM source and retailer reference files must each be top-level JSON arrays.

This is intentionally an offline enrichment step: source acquisition/scraping remains separate so the execution layer can audit provenance and replay the same enrichment deterministically.
