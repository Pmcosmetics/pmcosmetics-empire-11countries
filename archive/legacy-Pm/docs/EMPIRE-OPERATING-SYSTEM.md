# PM Cosmetics Hub — Empire Operating System

## Mission
Build PM Cosmetics Hub as a scalable operating system for beauty commerce: one source of truth for markets, catalog, sales operations, automation, measurement, and launch execution.

## Current market configuration
The repository currently defines six markets: Egypt, Qatar, Bahrain, Saudi Arabia, United Arab Emirates, and Kuwait. Any seventh market must be explicitly approved and added to `config/markets.json`; it is not assumed here.

## Execution principles
1. **Truth before scale** — do not publish or advertise unverified catalog, pricing, stock, or claims.
2. **One canonical data model** — business data is separated from application code.
3. **Automation with guardrails** — automate repeatable work, but keep financial, legal, security, and irreversible actions behind explicit controls.
4. **Measure the funnel** — traffic, product views, add-to-cart, checkout, conversion, average order value, repeat purchase, return/refund rate, contribution margin, and customer acquisition cost.
5. **Deploy before promotion** — marketing readiness follows a real production smoke test.
6. **Small reversible changes** — every change is reviewable, testable, and traceable in Git.

## Operating layers
- **Brand & market layer:** market rules, localization, currency, availability, compliance notes.
- **Catalog layer:** SKU identity, product metadata, media references, price, stock, status.
- **Commerce layer:** storefront, cart, checkout handoff, order lifecycle.
- **Operations layer:** fulfillment, inventory, customer support, exception handling.
- **Intelligence layer:** dashboards, alerts, experimentation, prioritization, forecasting inputs.
- **Growth layer:** organic content, paid campaigns, CRM/retention, partnerships, launch playbooks.
- **Engineering layer:** CI, testing, security, observability, release management.

## 90-day execution gates
### Gate 1 — Foundation
- Repository structure and security baseline.
- Canonical market configuration.
- Validation and CI.
- Source-data ingestion contract.

### Gate 2 — Sellable core
- Validated catalog model.
- Responsive storefront.
- Product discovery and conversion path.
- Analytics events and error reporting.

### Gate 3 — Operations
- Order and fulfillment workflow.
- Inventory and catalog synchronization interfaces.
- Operational dashboard and alerting.
- Backup and recovery procedures.

### Gate 4 — Production readiness
- Production deployment.
- Smoke tests on the real deployment.
- Security/configuration review.
- Rollback procedure.

### Gate 5 — Growth
- Marketing assets.
- Market-specific launch campaigns.
- Measurement plan and experiment backlog.
- Promotion only after Gate 4 passes.

## Definition of done
A milestone is complete only when the intended behavior is implemented, validation passes, the change is traceable in Git, and any required production check is evidenced. Marketing launch is not considered complete until a real deployed smoke test passes.
