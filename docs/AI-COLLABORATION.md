# AI Collaboration Layer

## Purpose
Use GitHub Copilot and Meta AI as assistive layers around the PM COSMETICS HUB control plane.

## Operating model
ChatGPT -> Products OS -> Supabase -> GitHub -> runtime/integrations (Airtable, Vercel, Railway, Manus, WooCommerce, Shopify/marketplaces)

AI assistants:
- GitHub Copilot: repository/code/CI assistance; changes through branches and pull requests.
- Meta AI: customer-facing/Meta ecosystem assistance only after an approved Meta integration is connected.
- ChatGPT: orchestration, evidence review, and release-gate coordination.

## Safety gates
1. No AI assistant receives Supabase service-role secrets.
2. No assistant may mark a product Published without verified evidence.
3. Product publication remains gated until Supabase is active and Product Evidence Gate passes.
4. Code changes use a branch/PR workflow.
5. External AI integrations use least-privilege credentials and explicit user authorization.

## Current verified state (2026-10-02)
- Supabase project rhozehqlpnmzmknlpmvf is currently ACTIVE_HEALTHY in eu-west-1.
- The live public schema contains a products table (2 rows) and inventory table (2 rows); the two current product rows are inactive, so there is no active commercial product in the current Product Master snapshot.
- blocked_products contains 73 records: 1 Active, 6 Archived, 66 Needs Review. These remain evidence-gated records and do not open publication.
- Google Drive is not currently available through the connected ChatGPT tools because the Google Drive connector is disabled by administrator policy.
- Dropbox account access is available, but the PM COSMETICS HUB folder is currently empty and a filename-only search returned no products.csv. The large-source ingestion/reconciliation work is tracked in GitHub Issue #23.
- The canonical GitHub main commit b7f1dd4bff3f9b2f59b0f50c5360b769b0785 was pushed on 2026-10-02.
- On that commit, PM COSMETICS HUB CI, Actions Heartbeat, Actions Startup Smoke Test, CodeQL Advanced, and Code Quality all completed successfully. The Notify CI failures workflow was skipped as expected because the preceding checks were successful.
- The commercial Publish Gate remains CLOSED until the real product source passes identity, provenance, SKU/GTIN, stock, cost, image, and reconciliation checks.

## Current blockers
- Canonical product source: no verified products.csv is available in the currently connected file sources.
- Product reconciliation: staging/evidence sources are not the canonical production dataset; do not invent or bulk-promote product fields.
- External publication: Shopify, Noon, Amazon, Jumia, and other commercial writes remain locked by the publication/evidence gate.

## First automation targets
- Copilot: validate product data contracts against the real source export without modifying publication status.
- Copilot: keep CI verification and evidence artifacts current on main.
- Meta AI: connect only after the Meta developer integration is actually authorized and testable.
- Release: require CI + Evidence Gate + integration verification before publication.

## Non-goals
This document does not store API keys, access tokens, cookies, or service-role credentials.
