# PM COSMETICS HUB - Empire 11 Countries 👑

**The Complete E-Commerce Empire for Beauty Products Across 11 Markets**

---

## 🌍 The 11 Countries

1. 🇪🇬 Egypt - EGP
2. 🇸🇦 Saudi Arabia - SAR
3. 🇦🇪 United Arab Emirates - AED
4. 🇰🇼 Kuwait - KWD
5. 🇶🇦 Qatar - QAR
6. 🇧🇭 Bahrain - BHD
7. 🇴🇲 Oman - OMR
8. 🇯🇴 Jordan - JOD
9. 🇵🇸 Palestine - ILS
10. 🇱🇧 Lebanon - LBP
11. 🇮🇷 Iran - IRR

---

## 🔒 Verified Launch Gate

The repository remains **closed for unverified product intake and publication** until source evidence is validated.

- Product identity, pricing, stock, barcode, and images must be evidence-backed.
- Catalog and inventory validation are mandatory.
- Products API remains locked while source intake is unverified.
- No guessed or placeholder product data should be added to production.
- GitHub Actions CI uses Node.js 20 as the current known-good project runtime.
- GitHub Pages and Supabase remain separately tracked infrastructure surfaces; Supabase production connectivity and RLS are independently verified, while GitHub Pages still requires separate deployment verification.

**Current verification policy:** a green GitHub workflow requires an actual Job and successful Build + Validate steps; a workflow existing without a Job is not treated as successful.

---

## 📊 Platform Architecture

PM COSMETICS HUB - Central Platform
- Admin Dashboard & Management
- Core Database & API Layer
- Multi-Channel Sales: Shopify, Instagram, Etsy, Jumia, Amazon, TikTok, WhatsApp, Facebook, Local

Control flow:

Evidence -> Validation -> CI -> Publication Gate -> Channel Sync -> Verification

---

## 📁 Project Structure

pmcosmetics-empire-11countries/
- app/
- config/markets.json
- config/catalog.schema.json
- data/
- integrations/
- docs/
- scripts/validate.mjs
- scripts/validate-catalog.mjs
- scripts/validate-inventory.mjs
- scripts/build.mjs
- .github/workflows/ci.yml
- .github/workflows/codeql.yml
- .github/workflows/notify-ci-failure.yml
- .github/workflows/sync-data.yml
- package.json
- README.md

---

## 🚀 Getting Started

git clone https://github.com/Pmcosmetics/pmcosmetics-empire-11countries.git
cd pmcosmetics-empire-11countries
npm ci
npm run build
npm run validate

---

## 📊 Phase 1: Foundation

- [x] Repository Created
- [x] Project Structure Setup
- [x] Configuration Files
- [x] Market Definitions
- [x] Documentation
- [x] Validation scripts
- [x] Build script
- [x] Database Schema Implementation (Supabase schema verified)
- [x] API Framework Setup (health endpoint + locked product routes)
- [x] Authentication System foundation (Supabase Auth + server-side exact-email allowlist + Google/Magic Link UI) — Google Provider client credentials remain external setup

---

## 🏪 Phase 2: Platform Integration

- [x] WooCommerce Central Backbone (evidence-gated connector)
- [x] Shopify Integration (connected; commercial publication remains evidence-gated)
- [ ] Instagram Shop Setup
- [ ] Etsy Listing Integration
- [ ] WhatsApp Business API
- [ ] Jumia Integration
- [ ] Amazon Integration

---

## 📦 Phase 3: Features

- [x] Product Catalog Management (Supabase-backed Operations Dashboard)
- [x] Inventory Management (Supabase-backed Operations Dashboard)
- [x] Multi-Currency Pricing foundation (7 active currencies; target currency required for non-EGP channels)
- [x] Order Management foundation (orders schema + Operations Dashboard; external ingestion remains channel-gated)
- [x] Customer Analytics foundation (analytics view + Operations Dashboard)
- [x] Reporting Dashboard (Supabase reporting snapshot + authenticated Operations Dashboard)

---

## 🔐 Security & Compliance

- No secrets in Git
- Environment variables for credentials
- HTTPS only
- Data encryption
- GDPR/PCI requirements must be validated against actual deployment and jurisdictions

See docs/SECURITY.md for project guidance.

## ⚙️ Execution Control

Canonical runtime checks are enforced by `.github/workflows/ci.yml`. Unrelated template workflows are manual-only; product publication remains evidence-gated.

**AlFouad reference:** `data/references/alfouad-store-reference.json` — taxonomy/UX reference only; PM evidence gate remains authoritative.

**2026-10-01 operations sync:** CI gate validation fix merged to `main`; Railway production remains evidence-gated with commercial writes locked until verified product evidence is complete.

**2026-10-01 telemetry sync:** Amplitude server telemetry is env-gated and remains disabled until `AMPLITUDE_API_KEY` is configured in the deployment environment. Commercial publication remains CLOSED.

**2026-10-04 currency safety sync:** Live Shopify Admin metadata reports the connected shop currency as **EGP** in Egypt. The Empire therefore keeps the primary catalog currency as EGP and must not auto-convert Egyptian retail prices into USD. The sync engine continues to block zero/placeholder prices and requires an explicit target currency for any non-EGP channel.

**2026-10-09 live reconciliation sync (latest direct Shopify Admin check):** Shopify reports **2,612** total product records: **2,582 DRAFT**, **30 ARCHIVED**, and **0 ACTIVE**. `DERMAELLE007` remains **DRAFT** (not live for public sale), priced at **239 EGP**, with **48** units, a SKU, and a Shopify CDN image. The current count matches the sum of the status counts; a complete paginated SKU-level comparison is still pending. The reference catalog contains **3,218 unique products / 3,479 category rows** and is not equivalent to verified Shopify stock. The Commercial Publish Gate remains **CLOSED**; do not bulk-publish or infer product readiness from reference data.

**2026-10-05 authentication sync:** The Empire now performs server-side Supabase Auth token verification through `/auth/v1/user` and enforces the exact allowlist `shukrypeter79@gmail.com` / `shukrypeter102@gmail.com`. The public auth page still supports Google OAuth and passwordless email links. Google Provider client credentials remain the only external Auth setup dependency.

**2026-10-05 security sync:** Production security review is recorded in `docs/SECURITY.md`. Git secrets review passed with no live credential pattern found; production credentials remain environment/secret-store based. HTTPS is enforced at the deployment edge and in application configuration, auth endpoints are rate-limited, core commerce RLS is verified, and GDPR/PCI/Egypt/Saudi/UAE compliance remains explicitly **not signed off** pending legal/contractual/data-flow evidence.

**2026-10-09 product reconciliation:** The recorded Product Master evidence snapshot contains **73** records: **1 Publish-Ready**, **52 Blocked — Identity**, and **20 Blocked — Image/Stock**. The latest direct Shopify query reports **2,612** records (**2,582 Draft, 30 Archived, 0 Active**). `DERMAELLE007` remains Draft in Shopify despite its Product Master evidence status. Current quality checks flag **2,489 zero-inventory records**, **32 zero-price records**, and **726 records whose vendor field is `AlFouad Pharmacies`**; these are reconciliation blockers, not proof of publish readiness. Observed catalog issues also include missing SKUs, exact/near-duplicate titles, and non-cosmetics items. Preserve audit history; archive only verified duplicate/non-cosmetics records after record-level comparison, and do not bulk activate while the gate is closed.

---

## 📚 Documentation

- Setup Guide: docs/SETUP.md
- Architecture: docs/ARCHITECTURE.md
- Security: docs/SECURITY.md
- API Reference: docs/API.md
- Deployment: docs/DEPLOYMENT.md

---

## 🎨 Branding

**Logo:** PM COSMETICS HUB (Golden PM + Circle)  
**Colors:** Gold (#D4AF37) + Black (#0A0A0A)  
**Font:** Modern, Premium  
**Tagline:** "Empowering Beauty Across 11 Countries"

---

## 📞 Support & Contact

- Email: tech@pmcosmetics.hub
- WhatsApp: Business Channel
- Instagram: @pm_cosmetics1
- Website: https://pmcosmetics.github.io/pmcosmetics-empire-11countries

---

## 📄 License

Private - PM COSMETICS HUB™

---

**PM COSMETICS HUB — evidence first, validation before publication.**


## 🔗 Connection Center

Central live connection page for Windsor.ai and external seller authorization:

- Connection Center: /ops/connections.html
- Windsor only reports an account as connected after the provider account appears in the live connector list.
- Etsy Seller and WhatsApp Cloud API are not exposed as Windsor connectors and require their provider-native authorization paths.
- Commercial Publish Gate remains CLOSED during authorization and reconciliation.


## 🧩 Empire Template System

The reusable Template System standardizes Product Evidence → Product Master → Market → Channel Listing → Evidence Review → Publish → Verify → Operations Audit. It accelerates execution without bypassing the Evidence Gate, price/currency safety rules, or publication controls.

- Specification: `docs/TEMPLATE-SYSTEM.md`
- Registry: `config/template-system.json`
- Field contracts: `config/template-fields.json`

**Templates accelerate execution; evidence controls publication.**
