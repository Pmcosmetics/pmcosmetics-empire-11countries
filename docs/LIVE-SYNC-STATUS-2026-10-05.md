# PM COSMETICS HUB — Cross-System Live Sync Status — 2026-10-05

## Canonical control point
- GitHub: Pmcosmetics/pmcosmetics-empire-11countries
- Branch: main
- Latest observed commit: `72e7d800efdbffec9ab5c86e01d189a03493d88b`
- Latest commit purpose: adds the live-sync verification script; the preceding main history also contains the authoritative evidence-only batch publication hardening.
- Commercial Publish Gate: CLOSED.

## Current product/commercial state
The canonical README on main records the latest 2026-10-05 reconciliation:
- Shopify: 215 catalog products observed; 1 ACTIVE and 214 non-ACTIVE.
- Active pilot SKU: DERMAELLE007, price 239 EGP, 48 units at Shopify Shop location.
- Product Master: 73 records = 1 Publish-Ready, 52 Blocked — Identity, 20 Blocked — Image/Stock. Older 51/21 and 59/13 splits are historical and not the current execution source.
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
## Railway certification status
- Current session: **NOT CERTIFIED** for runtime synchronization.
- Reason: direct Railway runtime access is unavailable in this workspace and the Railway connector is not connected.
- A prior snapshot references runtime SHA `376d50a305204e9a2db8186da64e8e8672a3c348`, but that SHA does not exist in the current GitHub repository; it is not accepted as proof of the running version.
- Commercial Publish Gate remains **policy-closed** in the code/configuration, but the live runtime gate must be re-read before certification.
