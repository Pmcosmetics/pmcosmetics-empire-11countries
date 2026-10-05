# PM COSMETICS HUB — Deployment

## Production targets

### Railway
Production API/service: pmcosmetics-empire-11countries-production.up.railway.app
Health endpoint: GET /api/health

Current production controls:
- HTTPS/TLS at the public edge
- application HTTPS enforcement controlled by HTTPS_ONLY
- authenticated endpoint rate limiting
- COMMERCIAL_PUBLISH_GATE=CLOSED unless explicitly opened after evidence verification
- no public TCP proxy on the production app

### Supabase
Project: rhozehqlpnmzmknlpmvf

Use Supabase as the transactional data layer. Keep privileged/service-role credentials out of browser code and Git.

### GitHub
Canonical repository: Pmcosmetics/pmcosmetics-empire-11countries
Canonical CI: .github/workflows/ci.yml
Unrelated template workflows must remain manual-only.

## Required environment configuration

Use Railway/Vercel secret storage for real credentials.

Minimum runtime controls:

NODE_ENV=production
HTTPS_ONLY=true
COMMERCIAL_PUBLISH_GATE=CLOSED
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=60
SUPABASE_URL=https://rhozehqlpnmzmknlpmvf.supabase.co
SUPABASE_PUBLISHABLE_KEY=

Provider credentials are provider-specific and must remain server-side.
See .env.example for the non-secret variable inventory.

## Deployment sequence

1. Push to the canonical GitHub repository.
2. Let .github/workflows/ci.yml run Build + Validate + Gate checks.
3. Review CodeQL/security results.
4. Deploy to Railway only after CI is green.
5. Verify /api/health, /api/auth/config, /api/auth/session without a token returns 401, and /api/readiness.
6. Verify Product Evidence Gate state.
7. Keep the Commercial Publish Gate closed unless the exact product/channel set is approved.
8. After external-channel writes, reconcile live channel state back into Airtable/Supabase evidence.

## Authentication deployment

Authentication uses Supabase Auth.
Server verification endpoint: https://rhozehqlpnmzmknlpmvf.supabase.co/auth/v1/user
Allowed identities are exact-match only.
Google OAuth still requires the Google Provider Client ID/Secret to be configured in Supabase Auth. Do not fabricate or commit those values.

## Shopify deployment notes

The connected Egypt shop is verified at EGP.

Do not:
- auto-convert EGP retail numbers into USD
- bulk-activate products
- treat a draft/archived Shopify product as proof of PM stock
- bypass Product Evidence Gate

Current controlled-pilot SKU: DERMAELLE007 — 239 EGP — 48 Shopify units

## WhatsApp deployment notes

Production callback: https://pmcosmetics-empire-11countries-production.up.railway.app/api/whatsapp/webhook

Required secret variables:
- WHATSAPP_BUSINESS_ACCESS_TOKEN
- WHATSAPP_BUSINESS_PHONE_NUMBER_ID
- WHATSAPP_BUSINESS_VERIFY_TOKEN
- WHATSAPP_WEBHOOK_SECRET

Meta verification is required before calling the Cloud API integration live.

## Rollback

For a bad deployment:
- stop live publication first
- redeploy the last known-good Railway deployment
- preserve Airtable/Supabase evidence history
- do not delete audit records merely to hide a failed sync
- re-run CI and reconciliation before reopening the commercial gate

## Compliance

Production deployment is not a blanket declaration of legal compliance.
Before processing personal data commercially across the 11 configured markets, validate the applicable privacy notice and legal basis, retention/deletion and data-subject request workflows, processor/subprocessor DPAs, international transfer mechanisms, Egypt PDPL obligations, Saudi PDPL transfer conditions, UAE PDPL transfer conditions, and PCI DSS scope/SAQ based on the actual payment flow.

See docs/SECURITY.md.