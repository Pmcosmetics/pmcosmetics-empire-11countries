# PM COSMETICS HUB — Security and Intellectual Property Hardening Plan
Date: 2026-10-16
Status: proposal only; no production controls changed.

## Security objective
Protect business data, customer information, source code, brand assets, product evidence, credentials, and intellectual property using least privilege, layered defenses, traceable approvals, and tested recovery. Absolute zero-risk cannot be guaranteed.

## Evidence-based findings
1. GitHub default branch `main` was reported unprotected, with required status checks disabled. This is a high-priority governance gap.
2. The repository contains CodeQL and CI workflows; the CI workflow pins key actions to immutable commit SHAs and requests `contents: read`. This is positive but not a complete security guarantee.
3. No `.github/dependabot.yml` was found at the expected path in the inspected default-branch contents. Verify dependency update configuration in GitHub settings before treating it as absent.
4. The application allowlist in `config/auth-identity.json` includes the primary and secondary email addresses. A repository file is not proof of effective deployed authorization. Confirm both users' actual roles and least-privilege needs before changing it.
5. Supabase tables in the read-only listing showed RLS enabled. This does not establish that individual RLS policies are correct or that storage buckets, functions, grants, Auth settings, and secrets are safe.
6. Production runtime identity and live security headers were not independently certified in this pass.
7. The repo is public according to repository metadata. Assume every committed file is publicly readable. Do not commit confidential business information, customer records, access tokens, credentials, or private supplier documents.

## Required control baseline (proposed)
### GitHub and source code
- Protect `main`: require pull requests, at least one independent review where available, successful required CI/security checks, resolved review conversations, and block force pushes/deletion.
- Use least-privilege GitHub App/OAuth access; remove stale collaborators only after ownership and dependency review.
- Enable secret scanning, push protection, Dependabot alerts/security updates, and CodeQL/SAST where supported by the plan.
- Pin third-party GitHub Actions to full commit SHAs; review each SHA and update through a controlled PR.
- Generate dependency inventory/SBOM and scan for vulnerable dependencies; review licenses before commercial use.
- Keep private customer/supplier data and sensitive operational docs outside public repositories. If secrets ever appear in Git history, revoke/rotate them immediately; deleting the file alone is insufficient.

### Identity, sessions, and data
- Enforce MFA/passkeys on GitHub, Railway, Supabase, Shopify, primary email, domain/DNS, and other provider owner accounts.
- Use separate named accounts and least privilege; avoid shared passwords and broad long-lived tokens.
- Store secrets only in provider secret managers; separate dev/staging/prod; rotate tokens after suspected exposure and document ownership/expiry.
- Audit Supabase RLS policies per table and role, grants, Storage policies, Edge Functions, Auth redirect URLs, rate limits, leaked-password protection, and audit logs.
- Do not include PII, full tokens, secret values, or customer data in CI logs, screenshots, support tickets, or AI prompts.
- Define retention/deletion, encrypted backups, and a tested restoration procedure.

### Railway and release integrity
- Keep production deployments tied to reviewed commits and successful required checks.
- Verify production service source, branch, root directory, build/start commands, domains, variables by name only, and current runtime SHA.
- Use staging or preview deployment and smoke/readiness tests before production approval.
- Keep rollback target and recovery instructions documented; never expose environment variable values in audit reports.
- Do not deploy the latest main just because it is newer; verify compatibility and migration safety first.

### Intellectual property and copyright
- Keep dated evidence of authorship, source commits, design originals, logo/source files, product photography rights, contracts, licenses, and supplier permissions.
- Add a root-level NOTICE/third-party attribution inventory after checking actual licenses; do not claim exclusive rights to third-party brands, product images, or catalog copy without authorization.
- Use original PM brand assets and only licensed product images/content; distinguish retailer reference data from company-owned stock and product evidence.
- Consider trademark registration for the PM COSMETICS HUB brand/logo and jurisdiction-specific legal advice for relevant markets. A Git commit alone does not establish all copyright or trademark rights.
- Keep a private evidence archive with hashes, timestamps, access controls, and backups. Avoid putting confidential evidence in this public repository.

## Recommended implementation sequence
P0. Confirm provider owner identities, MFA, recovery methods, collaborator list, and the exact production service/release SHA.
P0. Propose and review branch protection and secret-scanning settings; apply only with owner approval and a recovery path.
P0. Audit public repo contents and git history for accidentally committed secrets or confidential data; rotate exposed credentials immediately if found.
P1. Audit Supabase policies and effective application roles using read-only queries/tests.
P1. Add dependency/SBOM/license scanning and strengthen CI gates through a pull request.
P1. Verify Railway staging build, health/readiness, CSP/security headers, and rollback procedure.
P1. Reconcile product evidence and copyright/usage rights before any bulk publication.
P2. Create an incident response and backup-restore drill, then schedule periodic access reviews.

## Safety boundary
This document does not assert that the system is breach-proof. No live security settings, branch rules, provider permissions, secrets, production services, customer records, product listings, or publication gates were changed.
