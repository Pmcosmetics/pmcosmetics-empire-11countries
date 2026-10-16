# PM COSMETICS HUB — Manus 300+ App Integration Plan

**Status: IMPLEMENTED IN A REVIEW BRANCH; NOT CONNECTED OR DEPLOYED.**

## Goal

Make 300+ business applications reachable through a controlled integration layer without claiming that catalog entries are already connected. Use three routes:

1. **Native Manus connectors / MCP** for applications with an authorized connector in the Manus account.
2. **Zapier or Make hub** for the long tail of applications and event-triggered workflows.
3. **Direct vendor APIs** for high-value systems that need predictable contracts, reconciliation, or commerce-grade controls.

Manus's official connector guide says a connector must first be authorized in the Manus web app, then its ID is passed into API tasks. The official `connector.list` endpoint reports connectors installed in the current account. Manus also advertises Zapier as a route to thousands of apps. References:
- https://open.manus.ai/docs/v2/connectors
- https://open.manus.ai/docs/v2/connector.list
- https://www.manus.im/features

## Important counting rule

The target is **at least 300 usable app integrations**, not 300 names in a list. Count an app only after its account authorization, scoped permissions, connector/workflow ID, successful read-only smoke test, owner, and last-verified timestamp are recorded. A Zapier connector by itself does not mean every app reachable through Zapier is connected. The current verified app count is **not yet measured**; do not label it 300+ until evidence supports that claim.

## Rollout

### Phase 0 — Control and evidence (this branch)
- Add an authenticated, rate-limited, read-only endpoint to list connectors already installed in Manus.
- Keep the inventory endpoint disabled unless `MANUS_CONNECTOR_INVENTORY_ENABLED=true` and `MANUS_API_TOKEN` are configured in Railway.
- Return connector metadata only; never return secrets or raw provider error bodies.
- Keep the commerce/evidence gates independent of integration availability.

### Phase 1 — Verify the Manus account
- Authorize only the intended Manus account and create/store its API key in Railway's secret-variable UI.
- Run the inventory endpoint and save a timestamped connector inventory as evidence.
- Compare installed connectors with the desired-app backlog; deduplicate aliases and multiple connectors for the same application.

### Phase 2 — Pilot the highest-value systems
Pilot in read-only mode first: GitHub, Railway, Shopify, Airtable, Supabase, Notion, OneDrive/Drive, Gmail/Outlook, Slack/monday.com, and Amplitude. Enable only connectors actually available to and authorized by the account.
- Read/status first; no product writes, price changes, customer messaging, or publication.
- Direct shop/marketplace operations stay behind separate per-channel authorization and Product Evidence Gate.

### Phase 3 — Expand to 300+
- Use Zapier/Make for suitable long-tail apps; use direct API or MCP only where the action contract and authorization are verified.
- Classify each connector: read-only, draft/write, or commercial write.
- Register scopes, owner, data classes, rate limits, failure/retry policy, idempotency key, last success, and revocation procedure.
- Add apps in batches of 10–20 with a smoke test and rollback plan. Stop each batch on authentication failures, duplicates, unexpected writes, or any gate-state change.

### Phase 4 — Operational readiness
- Reconcile connector inventory and live workflow runs daily.
- Alert on revoked OAuth, expired credentials, schema drift, repeated 4xx/5xx errors, and duplicate events.
- Never pass service-role/database secrets to Manus. Keep tokens server-side and least-privilege.
- Require human approval for any outward customer message, order mutation, product write, listing publication, payment action, or deployment.

## Release gates

An app is **verified connected** only when the account is authorized, its ID/workflow is discoverable, the intended read-only test succeeds, and evidence is timestamped. An app is **commercially enabled** only with a separately approved per-app capability and test record. Adding connectors never opens `COMMERCIAL_PUBLISH_GATE`, `BATCH_COMMERCIAL_PUBLISH_GATE`, or `PRODUCT_EVIDENCE_GATE`.

## Implementation in this branch

- Adds `GET /api/manus/connectors`, protected by the existing Empire authentication and rate limiter.
- The route only calls Manus `GET /v2/connector.list`; it does not create a Manus task or invoke external app actions.
- Adds a feature flag and requires the server-side `MANUS_API_TOKEN`.
- Adds status reporting and a test that unauthenticated callers are rejected.

## Not done yet

No Manus API key is configured by this change; no OAuth consent was granted; no third-party app accounts were connected; no 300-app count has been verified; no external workflows were run; no production deploy or commercial sync was initiated.
