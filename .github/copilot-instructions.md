# PM Cosmetics Hub — Copilot Project Instructions

## Project purpose
PM Cosmetics Hub is an evidence-first e-commerce platform for beauty products across 11 markets:
Egypt, Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman, Jordan, Palestine, Lebanon, and Iran.

## Non-negotiable project rules
- Do not invent, guess, or use placeholder product identity, price, stock, barcode, or image data.
- Treat product intake and publication as evidence-gated.
- Preserve the flow: Evidence -> Validation -> CI -> Publication Gate -> Channel Sync -> Verification.
- Keep product/API publication locked when source evidence has not been validated.
- Never commit secrets, credentials, access tokens, or private keys. Use environment variables and existing secret-management mechanisms.
- Do not weaken, bypass, or remove validation gates merely to make CI green.
- Changes to catalog, inventory, schemas, integrations, or publication logic must preserve validation behavior.
- Prefer small, reviewable changes with clear commit messages.

## Runtime and quality
- Current CI runtime is Node.js 20.
- Use the existing npm scripts and validation commands before changing their behavior.
- Preserve the existing build, validation, and test gates.
- When adding dependencies, explain why they are required and keep the dependency surface minimal.
- Match the existing repository style and structure.

## Data and integrations
- Source evidence must remain traceable.
- Multi-market behavior must respect the configured market definitions and currencies.
- Treat external integrations as unverified until their connection and returned data are independently confirmed.
- Do not claim a storefront, database, connector, or integration is live unless the repository/runtime evidence supports that claim.
- Canonical WhatsApp catalog number: +20 10 5565 5649 (201055655649).
- Backup/direct WhatsApp number: +20 12 0315 1461 (201203151461).
- Website routing may expose both numbers, while the catalog remains on the primary number.
- WhatsApp Cloud API remains unverified until Meta-side verification/configuration and runtime endpoint checks succeed.
- Never put WhatsApp tokens, verify tokens, webhook secrets, or other credentials in the repository.

## Railway deployment synchronization
- GitHub main is the canonical source of truth for deployable code.
- Do not report Railway as running a given commit unless the deployment metadata or HTTP/runtime evidence confirms that commit.
- Current tracked blocker: Issue #49 covers Railway source synchronization when redeploys can reuse an older snapshot.
- When investigating deployment drift, compare the GitHub main commit, Railway deployment/source metadata, and runtime health/version evidence before declaring success.
- Fix source synchronization rather than masking drift with unrelated application changes.

## Commercial publication gate
- The commercial Publish Gate is CLOSED unless Product Evidence Gate requirements are explicitly satisfied.
- Do not bulk publish or sync products to Shopify, Noon, Amazon, Jumia, or other channels when required evidence is missing.
- Product fields that require evidence include identity, image, stock, price, SKU/GTIN when applicable, and any required authorization/compliance evidence.
- Never convert a blocked/archived product into publish-ready status merely to advance automation.

## Security
- Never expose secrets in source code, logs, examples, fixtures, or documentation.
- Keep GitHub Actions permissions least-privilege.
- Do not replace pinned GitHub Actions with floating versions without an explicit reason and review.

## Pull requests and commits
- Work on a branch and use a pull request; do not push directly to main unless explicitly required by repository policy.
- Summarize what changed and why.
- Call out validation performed and any remaining blockers.
- If a change affects publication, catalog, inventory, authentication, payments, or external integrations, explicitly identify the affected gate.
