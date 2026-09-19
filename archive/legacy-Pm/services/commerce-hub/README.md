# Commerce Hub - Product API

This service is a lightweight skeleton for the Commerce Hub product APIs. It is intentionally minimal and does not persist data yet — POST/PATCH endpoints return accepted/updated responses for early integration testing.

Running locally

1. Copy environment example:

   cp .env.example .env

2. Install dependencies & run

   npm ci
   npm start

Notes & security

- SUPABASE_SERVICE_ROLE_KEY is a server-side secret. Never commit or expose it in client-side code.
- For local testing you may use a staging service key; never use production keys in local or CI fixtures.
- Persistence is disabled in the skeleton. Do not assume data is saved until migration 006 has been applied and runtime tests pass.

Development

- Tests: npm test
- Health check: GET /health

