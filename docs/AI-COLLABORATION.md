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
- Supabase project rhozehqlpnmzmknlpmvf is inactive because the account has reached the Free-plan active-project limit.
- GitHub Actions PM Cosmetics Hub CI and CodeQL currently report startup_failure before jobs are created.

## First automation targets
- Copilot: inspect and repair CI startup failures, then run contract tests.
- Copilot: validate product data contracts without modifying publication status.
- Meta AI: connect only after the Meta developer integration is actually authorized and testable.
- Release: require CI + Evidence Gate + integration verification before publication.

## Non-goals
This document does not store API keys, access tokens, cookies, or service-role credentials.
