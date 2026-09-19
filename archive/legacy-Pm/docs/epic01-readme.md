# EPIC01 — Commerce Hub foundation

## Definition of Done

- Product Master schema is present as migration `006_product_master.sql` and passes migration sequence validation.
- Commerce Hub service has a standalone location under `services/commerce-hub`.
- Product and SKU API boundaries are documented and testable.
- Inventory, pricing, and audit hooks have isolated service boundaries.
- Channel adapters implement the documented contract; Shopify remains mock-only until a dedicated integration phase.
- Contract tests cover happy path, idempotency, and 429 retry classification.
- OpenAPI and adapter documentation remain synchronized with the implemented boundaries.

## Merge checklist

- Review SQL/RLS manually.
- Run migration validation.
- Run service and contract tests.
- Confirm no secrets or production configuration changes.
- Confirm PR #16 remains untouched.
- Apply database changes to staging before production.
