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
- [ ] Authentication System

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

- [ ] Product Catalog Management
- [ ] Inventory Management
- [ ] Multi-Currency Pricing
- [ ] Order Management
- [ ] Customer Analytics
- [ ] Reporting Dashboard

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

**2026-10-05 live reconciliation sync:** Live Shopify currently reports **215** total catalog products with **1 ACTIVE** product and **214 non-ACTIVE** products. The active product is `DERMAELLE007`, priced at **239 EGP**, with **48** units confirmed at the Shopify `Shop location`. The store currently exposes Online Store, Shop, Point of Sale, and Inbox publications. The Commercial Publish Gate remains **CLOSED**.

**2026-10-05 product reconciliation:** `DERMAELLE007` is cross-linked across Airtable, Supabase, and Shopify. Airtable marks it **Publish-Ready** and the controlled pilot is live in Shopify. An archived Shopify duplicate with the same SKU is retained for audit history; no deletion or bulk activation was performed. The Product Master currently contains **73** records: **1 Publish-Ready**, **51 Blocked — Identity**, and **21 Blocked — Image/Stock**.

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
