# PM COSMETICS HUB — Product Master 72-Record Execution Plan — 2026-10-05

## 0. Authoritative count reconciliation
- Working set: 72 non-ready records out of 73 Product Master records, confirmed in `data/products/staging-evidence.json` verified 2026-10-05.
- Current staging evidence file classifies them as 52 `Blocked — Identity` + 20 `Blocked — Image/Stock`.
- Older README/integration snapshots contain different historical splits; these must not be treated as current. Use the current staging evidence file as the execution triage source; historical snapshots are retained only for audit context.
- Canonical remediation queue: `config/product-master-remediation-queue-2026-10-05.json`.
- Global Commercial Publish Gate remains CLOSED throughout this program.

## 1. Workstream A — Identity (52 records)
### Required evidence per record
- PM-owned product identity: brand, exact product name, exact size/variant.
- Valid PM SKU.
- Valid GTIN/barcode, with no synthetic or guessed identifier.
- Deterministic reference linkage/source URL or equivalent source evidence.
- Resolve duplicates and ambiguities; conflicting matches remain Needs Review.
- Identity evidence must be independently verifiable from PM-owned evidence; retailer/reference data can support identification but cannot prove PM ownership.

### Execution sequence
1. Freeze the 52-record Identity working list and assign a unique remediation case per SKU/source_record_id.
2. Normalize brand/name/size and deduplicate by GTIN, then source SKU, then exact brand+name+size signature.
3. Recover exact PM-owned SKU/GTIN evidence from supplier invoices, packaging/barcode photos, purchase records, or controlled source files.
4. Resolve ambiguous matches one record at a time; never auto-promote multi-hit matches.
5. QA the final identity packet and record the evidence references.

### Identity closure criterion
A record leaves `Blocked — Identity` only when the exact PM-owned identity is established, SKU and GTIN are present and validated, the product has a unique deterministic match to its evidence/source record, and QA marks `evidenceValidated=true`. The record may then enter the Image/Stock gate; it is not yet Publish-Ready unless all other evidence gates also pass.

## 2. Workstream B — Image/Stock (20 records)
### Required evidence per record
- PM-owned exact product image matching the exact variant/size.
- PM stock proof and reconciled quantity from a PM-owned source.
- Acquisition cost/provenance evidence.
- Supplier/batch/expiry evidence when applicable.
- Authorization document when required for the brand/product.
- No use of Shopify draft/archived presence as proof of PM stock.

### Execution sequence
1. Prioritize records with partial identity already established.
2. Verify exact image-to-variant match; reject lookalike or mismatched embedded images.
3. Reconcile physical stock against the PM-owned source and retain dated evidence.
4. Verify acquisition cost/provenance and any required authorization.
5. Run final QA across identity + image + stock + cost/provenance.

### Image/Stock closure criterion
A record leaves `Blocked — Image/Stock` only when identity is already verified and the full publish-ready evidence contract is satisfied: PM-owned exact image + PM stock evidence + cost/provenance + valid SKU/GTIN + QA pass + `evidenceVerified=true` + `publishable=true`.

## 3. Batch controls
- Work in small reversible batches; do not bulk-activate products.
- Every promoted record must have an evidence trail and a before/after state.
- No guessed SKU, GTIN, price, stock, cost, image, supplier, batch, expiry, or ownership.
- Reference catalog data remains reference-only.
- After each batch, reconcile Product Master -> Supabase blocked_products -> evidence registry.

## 4. Priority order
1. Reconcile the current 52/20 count and use the canonical 72-record queue.
2. Finish records with near-complete Identity evidence first.
3. Resolve high-value / high-confidence candidates next, including DERMAELLE028 and 86067.
4. Clear Image/Stock blockers for records whose identities are already fully verified.
5. Re-run the full Product Evidence Gate after each batch.

## 5. Completion definition for all 72
- 72/72 have a final, explicit disposition: `Publish-Ready`, `Needs Review`, or `Blocked` with a documented reason.
- Zero records remain in the wrong gate because of stale status mirrors.
- Every `Publish-Ready` record satisfies the same evidence contract used by DERMAELLE007.
- Product Master, Supabase, Airtable/evidence registry, and the Empire registry reconcile without unexplained count drift.
- Global Commercial Publish Gate stays CLOSED until separate channel authorization and commercial-release approval are satisfied.