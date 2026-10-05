# PM COSMETICS HUB — Commercial Publishing & Empire Evidence Ledger

**Snapshot date:** 2026-10-05  
**Canonical brand:** PM COSMETICS HUB  
**Primary repository:** Pmcosmetics/pmcosmetics-empire-11countries

## 1. Publication gate
- Commercial Publish Gate: **CLOSED**
- Batch Commercial Publish Gate: **CLOSED**
- Controlled pilot exception: **DERMAELLE007 is ACTIVE**
- Rationale: the system is evidence-gated and must not publish products without verified SKU/GTIN, PM stock, acquisition cost, exact image evidence, provenance, and required authorization.

## 2. Current product evidence state
Airtable Product Master contains **73** controlled product records:
- **1 Publish-Ready / published pilot:** DERMAELLE007
- **21 Blocked — Image/Stock**
- **51 Blocked — Identity**

### Published pilot
- Product: Dermaelle Hyalubalance Sebum Control Cleansing Gel 200ml
- SKU: DERMAELLE007
- GTIN: 6223007905060
- Verified PM stock: 48
- Verified PM acquisition cost: 260 EGP
- Exact image/evidence: verified OneDrive evidence
- Authorization status: Verified
- Retail price: **239 EGP**
- Shopify status: **ACTIVE**
- Shopify inventory: **48**
- Supabase status: **active**
- Supabase inventory: **48**
- Airtable gate: Publish-Ready
- Live Shopify URL: https://pmcosmetics-lgdc2mrf.myshopify.com/products/dermaelle-hyalubalance-sebum-control-cleansing-gel-200ml-1

## 3. Shopify live state
- Total products: **216**
- Draft: **134**
- Archived: **82**
- Active before pilot: **0**
- Controlled pilot now active: **1**
- Currency: **EGP**
- The older archived DERMAELLE007 duplicate remains archived as historical record and was not deleted.

## 4. Cross-system verification
On 2026-10-05 the pilot was reconciled across:
- Airtable Product Master
- Shopify Admin
- Shopify inventory location
- Supabase Product Master
- Supabase Inventory
- Supabase Retail Price

Observed commercial values match across systems: **239 EGP / 48 units / same product identity and image reference**.

## 5. Commercial rollout sequence
1. Evidence Gate QA
2. Controlled pilot publication
3. Post-publication verification
4. Channel-by-channel adapter verification
5. Batch eligibility evaluation
6. Batch publication only for products passing the same evidence contract
7. Rollback/incident record for any discrepancy
8. Empire-wide evidence ledger reconciliation

## 6. Mass-publishing rule
A product is eligible for batch handling only when all controlled checks pass:
- SKU present
- Product name present
- GTIN present
- Exact product image present
- PM physical stock > 0
- PM acquisition cost > 0
- provenance verified
- image verified
- authorization verified when required

No retailer listing is treated as proof of PM-owned stock, PM-owned image, cost, or authorization.

## 7. Current blockers
Infrastructure is healthy. The remaining commercial blocker is **evidence coverage for the other 72 controlled records**:
- 21 require PM image/stock evidence
- 51 require identity/SKU/GTIN evidence

No second product currently meets the complete evidence contract needed for safe batch publication.

Notion Command Center documentation is currently constrained by the workspace block limit; the durable operational record for this phase is maintained in GitHub and Airtable until Notion capacity is available.

## 8. Verification references
- GitHub CI for commit `5b92f39554c55735f9d2af8bfe0312458da6da05`: success
- Commercial rollout ledger commit: `3e421a6554e0ee2d4ba4e4379f48f0c1dd31d3d1`
- Pilot cross-system verification: 2026-10-05
- Railway Production deployment `c8076c56-71dd-475a-8080-1fd0e8ae81a2`: success
- Railway healthcheck `/api/health`: success
- Runtime gate: CLOSED
- Batch gate: CLOSED

**Policy:** Keep the commercial gate closed globally while allowing only explicitly verified pilot exceptions. Do not bulk-publish unverified products.
