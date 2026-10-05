# PM COSMETICS HUB — Cross-System Live Sync Status — 2026-10-05

## Canonical control point
- GitHub: Pmcosmetics/pmcosmetics-empire-11countries
- Branch: main
- Latest observed commit: 58b45fc5f6aff13457cdc4969cc81a13a643aee0
- Latest commit purpose: authoritative evidence-only batch publication; server verification is required and client-supplied eligibility flags are not trusted.
- Commercial Publish Gate: CLOSED.

## Current product/commercial state
The canonical README on main records the latest 2026-10-05 reconciliation:
- Shopify: 215 catalog products observed; 1 ACTIVE and 214 non-ACTIVE.
- Active pilot SKU: DERMAELLE007, price 239 EGP, 48 units at Shopify Shop location.
- Product Master: 73 records = 1 Publish-Ready, 51 Blocked — Identity, 21 Blocked — Image/Stock.
- No bulk activation or deletion was performed.
- An archived Shopify duplicate for the pilot SKU is retained for audit history.
- Primary catalog currency remains EGP; non-EGP channels require explicit target currency.

## Security / identity
- Server-side Supabase Auth token verification is implemented.
- Current exact application allowlist remains shukrypeter79@gmail.com and shukrypeter102@gmail.com.
- Google OAuth remains available in the public auth UI; Google Cloud client credentials remain the external setup dependency.
- Production security review is documented; GDPR/PCI/Egypt/Saudi/UAE compliance is not signed off pending legal/contractual/data-flow evidence.

## Integration map
- GitHub: connected; this repository currently exposes push/triage access.
- Notion: connected; existing command-center pages are available for updates, but the workspace reports the free block limit for new blocks.
- Slack: connected; the searched #team-updates channel was not found. Available active channels include #all-pm, #new-channel, #proj-, and #social.
- Shopify: the repository documents a connected Shopify Egypt store, but the native Shopify ChatGPT connector is not exposed in the current session, so no direct Shopify mutation was performed here.
- Windsor.ai: the repository tracks connected/authorization-pending connector state; no new external seller authorization was claimed from this session.
- Airtable/Supabase: remain the operational/product evidence layers described by the repository architecture.

## Reconciliation rule
Evidence -> Validation -> CI -> Publication Gate -> Channel Sync -> Verification

No guessed product data, secret, credential, bulk publish, or irreversible catalog mutation was introduced during this sync pass.

## Next executable blockers
1. Keep the Commercial Publish Gate closed until product evidence and channel authorization are independently satisfied.
2. Complete the Shopify ChatGPT connector authorization outside this session before attempting direct Shopify operations.
3. Reconcile any older snapshots against the latest main evidence before treating them as authoritative.
4. Continue the one-product reversible pilot path only after the authoritative Evidence Gate remains green.