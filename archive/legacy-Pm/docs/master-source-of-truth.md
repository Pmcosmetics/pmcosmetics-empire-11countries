# PM Cosmetics HuB — Master Source of Truth

**Status:** ACTIVE / CONTROLLED EXECUTION
**Last synchronized:** 2026-09-03

## Canonical system roles

- **GitHub (`Pmcosmetics/Pm`)** — canonical source for application code, workflows, releases, and technical execution.
- **Notion** — canonical command center for decisions, evidence, execution status, and business documentation.
- **WhatsApp Business** — primary customer/order channel; operational numbers: `01203151461`, `01055655649`.
- **Airtable** — optional operational data layer; not promoted to product master until its schema and records are validated.
- **CMS Open Data** — optional external analytics connector; not part of the PM Cosmetics core workflow unless a specific supported use case is approved.

## Current market map

Egypt, Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman.

## Operating gates

1. Identity & asset verification
2. Security
3. Backup / rollback
4. GitHub / build verification
5. Catalog QA
6. Commerce preparation
7. Execute
8. Verify with evidence
9. Roll back on failure

## Non-negotiable rules

- No production secrets or API keys in Git.
- No destructive bulk changes without a validated backup/rollback path.
- No product publication before identity, image, price, SKU/size where available, and availability are verified.
- Retail price must be verified before calculating wholesale; current rule is `Wholesale = Retail × 0.70`.
- Never claim an action is complete without confirmation from the target system.
- Conflicts between sources are logged and resolved explicitly; authoritative data is never silently overwritten.

## Synchronization decision — 2026-09-03

The repository `Pmcosmetics/Pm` is the active technical repository and has admin/maintain/push access in the connected GitHub environment. Recent history shows GitHub Pages deployment work, duplicate workflow removal, and a WhatsApp order-flow addition.

Notion currently contains multiple generations of the command-center and registry pages. The canonical working command center is `PM.Cosmetics — مركز القيادة (1)` for this synchronization pass; duplicate/older pages are not deleted automatically.

The next controlled execution target is to reconcile the Asset Verification Matrix and Master Platform & Channel Registry against the GitHub technical baseline, then move verified assets into the commerce/catalog workflow.
