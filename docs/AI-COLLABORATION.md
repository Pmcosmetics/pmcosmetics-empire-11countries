# AI Collaboration Layer

## Purpose
Use GitHub Copilot and Meta AI as assistive layers around the Pmcosmetics Hub control plane.

## Operating model
ChatGPT -> Products OS -> Supabase -> GitHub -> Shopify/marketplaces

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

## Current blockers
- Supabase project rhozehqlpnmzmknlpmvf is currently INACTIVE; the connected Supabase account is at its Free-plan active-project limit, so the database cannot be treated as an active production dependency.
- The earlier GitHub Actions startup_failure incident was repaired for the canonical CI path and legacy PM Cosmetics CI: on 2026-09-21 the merged main commit created real jobs and completed build/validate/test successfully.
- The Pages/deploy path had a separate startup_failure with zero jobs and was subsequently changed to a Node-based build/validate + dist artifact workflow instead of relying on GitHub Pages enablement.
- The latest main commit 6e32656a71960b61d95e15e77305d2e9a2d8214e currently has no attached commit statuses, so the next verification step is to observe a fresh CI run on the current commit before treating CI as green.

## First automation targets
- Copilot: inspect and repair CI startup failures, then run contract tests.
- Copilot: validate product data contracts without modifying publication status.
- Meta AI: connect only after the Meta developer integration is actually authorized and testable.
- Release: require CI + Evidence Gate + integration verification before publication.

## Non-goals
This document does not store API keys, access tokens, cookies, or service-role credentials.
