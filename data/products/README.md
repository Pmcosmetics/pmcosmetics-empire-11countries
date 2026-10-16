# Product source staging

This directory is reserved for the verified PM Cosmetics product source. It must remain empty until the real source dataset is imported and passes identity, count, provenance, SKU, stock, cost, and image validation.

Current external staging reference:
- `PM_1264_Staging_Gate.xlsx` contains 1,264 staged source rows.
- That workbook is evidence/staging input, not the canonical production dataset.
- Staging evidence alone does not open the commercial publication gate.

Do not add guessed SKU, name, price, stock, barcode, or image values.

## Local Audit Notes — 2026-10-16

Status: Review only. Commercial Publish Gate remains CLOSED according to the available documentation; the live gate state has not been independently verified.

* The historical identity-blocked CSV contains 52 data rows and 52 unique record identifiers, checked by reading the file, not by an automated script.
* Record recPuPw7afgUZPvp1 (DERMAELLE008, Archived) requires owner review to explain its inclusion in the blocked list. No correction is assumed.
* Searches for DERMAELLE008 and its record identifier were inconclusive because the search stopped after 300 files. No conclusion about their absence elsewhere in the repository is justified.
* DERMAELLE028 is absent from the 52-row CSV. The available staging and enrichment records reportedly show a blank GTIN. The GTIN remains unresolved.
* data/products/README.md states that the directory should remain empty until a verified source is imported, while five files are reportedly present. Owner clarification is required before changing the policy or moving files.
* product-master-remediation-queue-2026-10-05.json was unavailable for comparison; consistency with the CSV is unverified.

Restrictions: This note authorizes no product edits, deletions, merges, publishing, synchronization, commits, or deployments. Any repository write requires separate explicit approval.
