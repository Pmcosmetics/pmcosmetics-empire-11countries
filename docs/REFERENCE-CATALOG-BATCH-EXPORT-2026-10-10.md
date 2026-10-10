# PM COSMETICS HUB — Reference Catalog Batch Export

Generated: 2026-10-10
Source: existing GitHub reference snapshot from AlFouad Pharmacies; no new Firecrawl scrape was performed because the connected Firecrawl credit balance is negative.

## Export summary
- Source categories loaded: 4 / 6
- Category records loaded: 1309
- Duplicate rows detected across loaded files: 9
- Unique reference records exported: 1300
- Batch size: 250
- Export files created: 6
- Firecrawl live extraction: blocked by exhausted credits; refresh/billing required before new live scrape.

## Category coverage
- العناية بالجسم (body-care.json): 921 rows
- العطور (perfumes.json): 178 rows
- عناية الأطفال التجميلية (kids-care.json): 157 rows
- الجمال الكوري (korean.json): 53 rows

## Category fetch errors
- skin-care.json: INVALID_ARGUMENT: Error code: INVALID_ARGUMENT; Error: HTTPError: 400: GitHub Fetch could not read file contents; the file may be too large or unsupported (Response: None)
- hair-care.json: INVALID_ARGUMENT: Error code: INVALID_ARGUMENT; Error: HTTPError: 400: GitHub Fetch could not read file contents; the file may be too large or unsupported (Response: None)

## Fields included
Each CSV includes product name, brand/category, source SKU, reference price (EGP), source availability, image URL, description, and source URL. Every exported row is explicitly marked reference_only=true, all PM evidence verifications are false, image-rights verification is false, and publish_status=HOLD — REFERENCE ONLY.

## Use restrictions
- These are reference records, not proof of PM stock, acquisition cost, ownership, or seller rights.
- A reference source's available flag must not be mapped to PM inventory.
- A source retail price must not be treated as PM-approved price.
- Use the source image URL only for review until reuse rights are confirmed.
- No marketplace listing was created or published by this export.

## Batch files
- data/reference-review-batches-2026-10-10/pm-reference-batch-001.csv — 250 records, 161156 characters
- data/reference-review-batches-2026-10-10/pm-reference-batch-002.csv — 250 records, 161178 characters
- data/reference-review-batches-2026-10-10/pm-reference-batch-003.csv — 250 records, 160279 characters
- data/reference-review-batches-2026-10-10/pm-reference-batch-004.csv — 250 records, 161918 characters
- data/reference-review-batches-2026-10-10/pm-reference-batch-005.csv — 250 records, 159614 characters
- data/reference-review-batches-2026-10-10/pm-reference-batch-006.csv — 50 records, 34419 characters

## Full coverage required
The repository's reference index currently declares 3,218 unique products across 3,479 category rows. This export covers only category files successfully fetched in this run. Complete skin-care and hair-care files if unavailable, then compare the combined deduplicated count with the expected reference snapshot before calling the export complete.
