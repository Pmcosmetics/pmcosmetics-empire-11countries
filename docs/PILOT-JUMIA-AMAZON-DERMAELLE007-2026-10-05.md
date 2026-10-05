# PM COSMETICS — Controlled Jumia + Amazon Pilot

Date: 2026-10-05
Status: CONTROLLED PILOT / AUTHORIZATION PENDING
Commercial Publish Gate: CLOSED
Source of Truth: Empire Product Master / Evidence Gate

## Pilot Product
- Seller SKU: DERMAELLE007
- Product: Dermaelle Hyalubalance Sebum Control Cleansing Gel 200ml
- GTIN: 6223007905060
- PM stock: 48 units
- PM acquisition cost: 260 EGP
- PM authorization: Verified
- PM QA: 2026-10-04
- PM-approved pilot retail price: 239 EGP
- PM exact-image evidence: recorded in Product Master

The 239 EGP figure is the PM-approved pilot price. Do not replace it with external promotional prices.

## Amazon Egypt
### Required authorizations
1. Active Seller Central Egypt account.
2. Business identity/address verification and requested documents completed.
3. Billing, store, and verification sections completed.
4. Two-step verification enabled.
5. SP-API developer/application registration.
6. Seller self-authorization for the PM seller account.
7. LWA client credentials and refresh token.
8. Required SP-API roles/scopes.
9. Credentials stored only in provider/deployment secret storage.

### Listing data
- Seller SKU: DERMAELLE007
- External product identifier: 6223007905060
- Brand: Dermaelle
- Item name: Dermaelle Hyalubalance Sebum Control Cleansing Gel 200ml
- Size: 200ml
- Product type/category: resolve from Amazon product classifier/taxonomy before submission; do not guess.
- Price: 239 EGP
- Quantity: 48
- Main image: PM-owned exact image evidence; upload only after authorization.
- Description/claims: manufacturer-derived copy only; no invented medical or therapeutic claims.

### Sync tests
- AUTH-01: Seller Central + SP-API authorization works.
- CAT-01: resolve the exact product by GTIN and avoid creating a duplicate catalog identity.
- LIST-01: create/update only seller SKU DERMAELLE007.
- INV-01: send quantity 48 and verify Amazon quantity.
- PRI-01: send 239 EGP and verify returned/displayed price.
- IMG-01: verify the PM-owned primary image passes validation.
- ATTR-01: confirm all mandatory attributes for the resolved product type.
- ORD-01: verify order retrieval/read path for the pilot.
- RECON-01: compare Amazon GTIN/SKU/price/stock against PM with zero unintended drift.

### Acceptance criteria
- Seller account and SP-API authorization are verified.
- GTIN resolves to the intended item or an exact new listing is approved without duplication.
- SKU maps one-to-one to PM.
- Quantity reconciles to 48.
- Price reconciles to 239 EGP.
- Exact PM-owned image is accepted.
- No blocking listing errors remain.
- Order read/reconciliation test succeeds.
- No blocked PM records are sent.
- Global Commercial Publish Gate stays CLOSED for all other products.

## Jumia Egypt
### Required authorizations
1. Active Jumia Vendor Center/Seller account.
2. Vendor Center API application registered.
3. Redirect/callback URL configured when applicable.
4. Client credentials or approved OAuth/refresh-token flow.
5. Seller/shop identifier and required API permissions.
6. Bearer access token obtained.
7. Secrets stored outside Git.

### Listing data
- Seller SKU: DERMAELLE007
- Parent SKU: DERMAELLE007 for this standalone pilot.
- Variation: DERMAELLE007 for this standalone pilot.
- Brand: Dermaelle
- Name: Dermaelle Hyalubalance Sebum Control Cleansing Gel 200ml
- GTIN: 6223007905060
- Category code: resolve from Jumia Egypt category API.
- Mandatory attributes: fetch the category attribute set and populate only from verified evidence.
- Primary image: PM-owned exact image evidence.
- Currency: EGP
- Price: 239 EGP
- Stock: 48
- Description: manufacturer-derived copy only.

### Sync tests
- AUTH-01: obtain and validate the Egypt seller/shop access token.
- CAT-01: resolve DERMAELLE007 in the correct shop/country.
- CAT-02: fetch category + mandatory attribute set.
- LIST-01: create only if the exact GTIN/product is not already present; otherwise update the exact listing.
- QC-01: submit the product feed and poll until COMPLETED/FAILED; capture QC status.
- INV-01: set stock to 48 and verify the returned stock.
- PRI-01: set 239 EGP and verify returned price.
- IMG-01: verify primary image and QC result.
- ORD-01: verify order retrieval path for the pilot SKU.
- RECON-01: compare Jumia SKU/GTIN/price/stock against PM.

### Acceptance criteria
- Vendor Center API authorization is verified for the PM Egypt seller/shop.
- Stable Jumia product/variation identity is returned after successful QC.
- SKU maps one-to-one to PM.
- Mandatory category attributes are complete and evidence-backed.
- Quantity reconciles to 48.
- Price reconciles to 239 EGP.
- Primary image is accepted and QC passes.
- Product becomes sellable only after QC + final review.
- Order retrieval works for the pilot.
- No blocked PM records are synchronized.
- Global Commercial Publish Gate stays CLOSED for all other products.

## Rollback
Stop channel writes on any identity mismatch, GTIN conflict, unexpected price/stock mutation, image/claims rejection, or reconciliation failure. Revert/deactivate only the pilot listing when necessary, restore PM as source of truth, record provider evidence, and do not scale the channel.

## Execution order
1. Amazon Seller Central + SP-API authorization.
2. Jumia Vendor Center API authorization.
3. Resolve platform taxonomies and mandatory attributes.
4. Run read/resolve tests.
5. Create/update DERMAELLE007 only.
6. Reconcile identity, image, price and stock.
7. Approve each channel pilot separately.
8. Keep every other product gated.
