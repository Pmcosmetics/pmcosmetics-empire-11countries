# PM COSMETICS HUB — Evidence Closure Queue
## PM-PUBLISH-BATCH-01-2026-10-05

**Current state:** PREPARED_NOT_ACTIVATED
**Commercial Publish Gate:** CLOSED

## Execution order

| Priority | Workstream | Evidence items | Owner | Exit condition | Next action |
|---|---|---:|---|---|---|
| P0 | Product Evidence | 9 | Product QA + Product Master Owner | All 9 product evidence records PASS; evidenceVerified=true; publishable=true | Verify the Drive artifacts and map each item to its evidence_id |
| P0 | Connected Channels — Facebook + Shopify | 12 | Channel Owner + Integration Engineer + QA | AUTH/CAT/SYNC/RECON/RB/SIGN all PASS for both channels | Collect and validate the 12 channel evidence records |
| P1 | Remaining Channel Authorization | 126 | Channel Owner + Integration Engineer | Provider authorization verified before channel tests | Complete OAuth/API/seller/bot authorization, then run tests |
| P0 | Batch QA | 6 | QA Lead | 100% evidence completeness; critical FAIL=0; price/stock/scope reconciled | Execute final QA pack and record timestamps |
| P0 | Rollback | 5 | Release Manager + Integration Engineer | Rollback and recovery PASS with timestamps | Run controlled rollback/recovery test |
| P0 | Release | 3 | Release Manager + Commerce Owner | GO sign-off; gate may open only for approved scope; post-publish reconciliation ready | Complete GO/NO-GO package and keep gate closed until PASS |

## Immediate collection order

1. Complete product evidence for DERMAELLE007.
2. Close all six acceptance tests for Facebook.
3. Close all six acceptance tests for Shopify while keeping the existing pilot under HOLD.
4. Finish authorization for the other 21 registered channels; no catalog writes before authorization.
5. Complete batch QA and rollback evidence.
6. Record final GO/NO-GO and only then consider opening the Commercial Publish Gate.

## Evidence status rule

`Pending Verification` = official Drive reference exists but the underlying artifact is not independently readable/validated in the current workspace.
`Blocked / Pending Authorization` = provider credentials/OAuth/seller access is not yet verified.
`Verified` = artifact is readable, mapped to its Evidence ID/Test ID, reviewed by the owner/QA, and passes the defined threshold.

**No activation while any P0 evidence item is Pending Verification, any channel is unauthorized, any critical test fails, or rollback is not proven.**
