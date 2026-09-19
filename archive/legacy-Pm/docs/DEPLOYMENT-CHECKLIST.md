# PM Cosmetics HuB — Production Deployment Checklist

## 1. Auth & Admin
- [ ] Confirm the production Supabase project is the intended project.
- [ ] Keep `pages/admin/config.js` limited to the Supabase URL and publishable/anon key.
- [ ] Never place `SUPABASE_SERVICE_ROLE_KEY` in browser code or Pages assets.
- [ ] Enable Leaked Password Protection.
- [ ] Enable Email Confirmations where required by the production auth policy.
- [ ] Review session expiry for the admin risk profile.
- [ ] Restrict Auth redirect URLs/origins to the production application domains.
- [ ] Verify the intended admin user exists in `public.admin_users` with the correct role.

## 2. Database & RLS
- [ ] Keep RLS enabled on `public.orders` and `public.admin_users`.
- [ ] Verify `orders` SELECT remains restricted to authorized admin/staff users.
- [ ] Do not restore direct browser INSERT/UPDATE access to `orders`.
- [ ] Keep `update_order_status` authorization tied to `auth.uid()` / `admin_users`.
- [ ] Review SECURITY DEFINER functions before every production schema change.
- [ ] Apply migrations in order and verify the resulting schema after deployment.

## 3. Secrets
- [ ] Store service-role and webhook secrets only in server/CI environment secrets.
- [ ] Do not print secrets in GitHub Actions logs.
- [ ] Do not commit `.env` files containing real credentials.
- [ ] If a secret is ever exposed, stop deployment, rotate it, remove the exposure, and audit usage.

## 4. Backups & Recovery
- [ ] Confirm scheduled backups are active.
- [ ] Record the latest successful backup time before production release.
- [ ] Confirm PITR/recovery strategy matches the production risk level.
- [ ] Perform a recovery drill using a safe/staging target when practical.

## 5. CI/CD
- [ ] Require CI validation before merging production changes.
- [ ] Keep deployment credentials in GitHub Secrets/Environment Secrets.
- [ ] Prefer protected production environments for deployment actions.
- [ ] Ensure failed validation blocks deployment.
- [ ] Current repository webhook CI validates Node syntax/dependencies; Render deployment is disabled unless `RENDER_DEPLOY_ENABLED=true`.

## 6. Smoke Test Before Release
1. Create a uniquely identifiable test order in a safe test context.
2. Confirm the order is visible to the authorized Admin session.
3. Confirm the authorized Admin can change status through `update_order_status`.
4. Verify the status change in the database.
5. Delete the test order and verify it is gone.
6. Confirm no test/customer data remains in public assets.

## 7. Monitoring
- [ ] Review Supabase logs for recent 5xx/RPC failures.
- [ ] Monitor webhook health and failed requests.
- [ ] Add alerts for repeated 5xx/RPC failures and backup failures when production volume warrants it.
- [ ] Keep an incident/runbook path for auth, webhook, database, and deployment failures.

## 8. Final Go/No-Go

### GO when
- Auth settings are reviewed.
- RLS/security checks pass.
- No browser service-role secret exposure exists.
- Backup/recovery strategy is confirmed.
- CI is green.
- Smoke test passes and test data is removed.
- Monitoring is sufficient for the current production stage.

### NO-GO when
- A service-role secret appears in browser-accessible code.
- RLS is disabled or unexpectedly permissive.
- Admin authorization cannot be verified.
- Production backup/recovery is unavailable for the required risk level.
- CI or smoke tests fail.
- Test or customer PII remains in public assets.
