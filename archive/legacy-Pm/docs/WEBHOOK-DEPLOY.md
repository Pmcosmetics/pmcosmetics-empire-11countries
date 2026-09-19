# PM Cosmetics HuB — Webhook Deployment Runbook

## 1. Supabase migration

For a new Supabase project:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push --dry-run
supabase db push
```

Verify the migration is recorded before proceeding:

```bash
supabase migration list
```

Do not run `supabase db reset --linked` against production; that command is destructive.

## 2. Webhook environment

Configure these variables on the webhook host, never in Git:

- `PORT`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VALIDATE_SIGNATURE=true`
- `NODE_ENV=production`

`SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to the Pages/admin browser.

## 3. Local install and checks

```bash
cd services/whatsapp-webhook
npm install
node --check server.js
npm start
```

Health endpoint:

```text
GET /health
```

Inbound endpoint:

```text
POST /whatsapp
```

## 4. Generate a signed test request

```bash
cd services/whatsapp-webhook
TEST_WEBHOOK_URL=https://your-host.example/whatsapp TWILIO_AUTH_TOKEN=your-token node test/signature-test.js
```

The script prints the form fields and the corresponding `X-Twilio-Signature`. The URL used to generate the signature must exactly match the URL received by the service.

For production, keep signature validation enabled. Twilio signs webhook requests and recommends validating the signature with its SDK rather than implementing custom signature validation.

## 5. Twilio configuration

Set the WhatsApp sender's incoming-message webhook to:

```text
https://<your-webhook-host>/whatsapp
```

Use POST. Confirm the endpoint is HTTPS.

## 6. Render CI/CD (optional)

The repository contains `.github/workflows/webhook-ci.yml`.

It always validates the webhook on pushes/PRs touching the service. Automatic Render deployment is disabled by default.

To enable it:

1. Create a Render deploy hook for the webhook service.
2. Add it as GitHub Actions secret `RENDER_DEPLOY_HOOK`.
3. Set repository variable `RENDER_DEPLOY_ENABLED=true`.

No secret is stored in the repository.

## 7. End-to-end checklist

- [ ] Supabase migration applied
- [ ] RLS verified
- [ ] Webhook `/health` returns `ok: true`
- [ ] Twilio signature validation enabled
- [ ] Twilio sender points to `/whatsapp`
- [ ] Test WhatsApp message creates one pending order
- [ ] Admin authentication works
- [ ] Admin can read orders using anon key + RLS
- [ ] Status changes are audited
- [ ] No customer PII exists in public GitHub Pages or `orders.csv`
