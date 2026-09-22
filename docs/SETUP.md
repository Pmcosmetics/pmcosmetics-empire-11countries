# PM Cosmetics Hub - Setup Guide

## Quick Start

### Prerequisites
- Node.js 20 (the repository's CI runtime)
- npm 9+
- Git
- Docker (optional; the current checked-in API does not require PostgreSQL to start)

### 1. Clone Repository
```bash
git clone https://github.com/Pmcosmetics/pmcosmetics-empire-11countries.git
cd pmcosmetics-empire-11countries
```

### 2. Install Dependencies
```bash
npm ci
```

### 3. Environment
Copy `.env.example` to `.env` only when you need environment-backed integrations. Never commit secrets.

### 4. Build, Validate, and Test
```bash
npm run build
npm run validate
npm test
```

### 5. Start the API
```bash
npm start
```

The current server exposes:
- `GET /api/health` → health response with the publication gate marked `CLOSED`
- `/api/products` → intentionally returns `503 DATA_INTAKE_LOCKED` until verified product intake is available

## Configuration

- Markets: `config/markets.json`
- Catalog contract: `config/catalog.schema.json`
- Product staging: `data/products/`
- Real product-image staging: `data/images/real/`

The repository currently requires evidence-backed catalog and inventory validation before publication. Do not add guessed SKU, name, price, stock, barcode, or image values.

## Current Implementation Status

The repository contains the validation/build/test gate and a minimal API server. Database, authentication, product intake, and channel integrations are not yet implemented as production services in the current `main` branch.

The checked-in `src/db/db.ts` is currently not wired into the running server; treat it as unfinished infrastructure rather than an active database layer.

## Testing

Run the contract gate with:
```bash
npm test
```

## Deployment

The repository's canonical CI workflow runs:
```bash
npm ci
npm run build
npm run validate
npm test
```

GitHub Pages, Supabase, and external sales-channel integrations require separate deployment/configuration work.

## Security

- Never commit `.env` or credentials.
- Keep secrets in the deployment platform's secret store.
- Do not publish unverified product data.
- Review `docs/SECURITY.md` before enabling integrations.
