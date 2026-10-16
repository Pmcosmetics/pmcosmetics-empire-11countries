# PM COSMETICS HUB — Read-only Execution Audit
Date: 2026-10-16
Branch: audit/2026-10-16-readonly-findings
Base: main @ 630278da896da29b644de30b0f279ac40d443881

## Scope and safety
This is an evidence snapshot only. No production deployment, product publication, Shopify writes, Supabase writes, credential changes, Railway changes, or changes to the global commercial gate were performed. Global Commercial Publish Gate remains CLOSED.

## Confirmed observations

### GitHub
- Canonical repository: Pmcosmetics/pmcosmetics-empire-11countries.
- Default branch: main.
- Current main head observed: 630278da896da29b644de30b0f279ac40d443881.
- Branch API reports main as unprotected and required status checks disabled. This is a high-priority governance risk; changing branch rules requires a separate reviewed/approved change.
- The repository-level connection has admin/push permissions, but this does not prove ownership of the Pmcosmetics organization.
- The CI workflow is SHA-pinned and requests contents: read, but branch protection currently does not require its checks.
- Main has moved 32 commits beyond Railway's currently recorded commit (comparison: bc032422f256ec02ecd7a2c02565590fbe16cfd8...630278da896da29b644de30b0f279ac40d443881). This does not itself establish that deploying the latest main is safe.

### Railway
- Project "Pmcosmetics Hub Production" has service pmcosmetics-empire-11countries sourced from Pmcosmetics/pmcosmetics-empire-11countries, branch main.
- Its latest recorded successful deployment is commit bc032422f256ec02ecd7a2c02565590fbe16cfd8 from 2026-10-13, 32 commits behind the observed main head.
- Separate project "Pmcosmetics Hub Empire" has service pmcosmetics-api sourced from the same repository but root directory /archive/legacy-nextjs-boilerplate and commit 216c5780a7fe4c8cfc8ccc0e66203ce0d6f1d4c2 in service configuration.
- Both services have no pending staged Railway changes. Neither service was changed, restarted, redeployed, or stopped.
- Live /api/health and /api/readiness endpoints were not accessible through the current web retrieval path; runtime health is therefore NOT independently certified by this audit.

### Shopify
- Connected shop: PM COSMETICS HUB EMPIRE · 11 COUNTRIES.
- Domain: pmcosmetics-lgdc2mrf.myshopify.com.
- Currency/country: EGP / Egypt.
- Shopify search reports 2,612 product records in total. A sampled page includes DRAFT and ARCHIVED records with missing SKUs and zero inventory. This sample is not a full status or SKU reconciliation.
- No Shopify products, prices, inventory, collections, or publication status were changed.

### Supabase
- Project rhozehqlpnmzmknlpmvf is reported ACTIVE_HEALTHY.
- Public tables observed all have RLS enabled in the table listing.
- The product/evidence structure includes products (2 rows), inventory (2), blocked_products (73), physical_inventory_verifications (1), commerce_channels (37), and order tables with zero rows in the observed snapshot.
- This is a structural read-only observation, not a complete policy/security audit. Previously documented leaked-password protection warning still requires checking in Supabase Auth settings; it was not changed.

### Identity and public routing
- Primary public customer contact remains 01055655649 / +201055655649 and primary business email shukrypeter79@gmail.com.
- Secondary account identity is shukrypeter102@gmail.com and secondary reference phone is 01203151461.
- Repository history documents a deliberate decision to route public customer WhatsApp CTAs to the primary number. Do not expose or reactivate secondary numbers as public routing without explicit approval.
- Some registry fields still duplicate the primary phone/email into secondary contact fields. Correct the identity metadata only after tracing consumers and preserving primary-only public routing.
- Application auth allowlist policy is intentionally sensitive and has changed several times in recent history. Do not expand or reduce it based solely on registry files; verify deployed application behavior and Supabase Auth independently.

## Priority remediation sequence

1. **P0 — Runtime and release alignment:** certify live health/readiness, identify the exact production SHA, and reconcile the 32-commit gap. Do not deploy main until CI/build/test and runtime compatibility are confirmed.
2. **P0 — Protect main:** propose branch protection requiring pull requests and successful required checks. Do not change the setting until reviewed and explicitly approved.
3. **P0 — Identity registry:** correct secondary reference fields while preserving the primary-only public routing rule; do not change authentication allowlists as part of this change.
4. **P1 — Shopify catalog reconciliation:** paginate all 2,612 records; calculate status totals; audit SKU/barcode, inventory, image, price, and evidence gaps; retain the global publish gate closed.
5. **P1 — Supabase security:** verify Auth leaked-password protection, RLS policies (not just RLS enabled flags), grants, and product/evidence consistency.
6. **P1 — Duplicate services/repositories:** document each service's purpose and dependency graph before archiving, deleting, or repointing anything.
7. **P2 — Channel readiness:** mark only integrations whose live OAuth/API connection has been tested as connected. Windsor.ai currently returns connected accounts for Facebook, Google Ads, and Google Business Profile; this does not establish that every social/commerce channel is connected.

## Explicitly not done
- No production deployment/redeployment/restart.
- No service stop/delete/source change.
- No Shopify or Supabase writes.
- No bulk product publish, merge, delete, price change, or inventory change.
- No credential, allowlist, or access-permission changes.
- No change to Global Commercial Publish Gate.
