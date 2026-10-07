# PM COSMETICS HUB — Empire Template System

## Purpose
The Template System is the reusable execution layer for the Empire. It standardizes how a product moves from evidence intake to a verified live listing across 11 markets and multiple channels.

It does not replace Product Master, Supabase, GitHub CI, Railway, or the Commercial Publish Gate. It is a controlled template layer above them.

## Canonical flow
**Template Intake → Evidence → Validation → Review → Ready → Publish → Verify → Complete**

No template may skip a required predecessor.

## Core rule
**Evidence first. Publication second.**

A template can create a draft, request evidence, validate fields, or prepare a channel payload. It cannot make a blocked product publishable.

### Hard safety rules
- Never invent SKU, GTIN/barcode, stock, cost, ownership or product identity.
- Never use placeholder commercial values as production data.
- Never auto-convert EGP into another currency for publication.
- Every non-EGP channel payload must contain an explicit target currency.
- A product must have an explicit **Ready** decision before publication.
- Blocked products remain outside bulk publication.
- Every publication must produce a receipt and then a verification result.
- Archived products remain auditable and are not silently reactivated.
- Template workflows remain separate from canonical CI unless explicitly promoted.

## 1. Product Evidence Template
Required evidence:
1. Exact product identity: brand + product name + size/variant.
2. SKU or source identifier.
3. Barcode/GTIN when available.
4. PM-owned exact product image.
5. Stock proof and quantity.
6. Cost proof.
7. Source/reference for the evidence.
8. Review decision.

Decision states: `Evidence Found`, `Missing`, `Conflict`, `Ready`, `Blocked`.

Blocker priority: **Identity → Image → Stock → Cost → Price/Currency → Channel Authorization**.

## 2. Product Master Template
The Product Master is the canonical normalized product object and follows `config/catalog.schema.json`.
Minimum canonical fields: `sku`, `name`, `brand`, `category`, `status`, `markets`, `pricing`.
The Product Master is the only source from which channel templates should be rendered.

## 3. Market Template
The Market Template reads `config/markets.json`. Each market supplies market ID, country, currency, language, timezone and supported channels.
The template must not infer a currency from a price value.

## 4. Channel Listing Template
A Channel Listing is a rendered view of an already validated Product Master record.

Targets include Shopify, WooCommerce, Salla, WhatsApp, Instagram/Facebook, Amazon, Jumia, Etsy, TikTok and local/offline catalog.

A channel payload must identify: **product → market → channel → target currency → price → evidence status**.

If required commercial data is missing or evidence is not Ready, the payload remains draft/blocked and must not be published.

## 5. Evidence Review Template
Review asks:
1. Is identity exact and evidence-backed?
2. Are image/stock/cost proofs present and consistent?
3. Is the intended market/channel price explicit and valid?

Result: `READY`, `BLOCKED`, or `CONFLICT`.

## 6. Publish Template
Publication preconditions:
- Product Master valid.
- Evidence decision = `READY`.
- Target market exists in `config/markets.json`.
- Target currency is explicit.
- Price is non-zero and non-placeholder.
- Channel authorization is present.
- No unresolved identity/image/stock/cost blocker.

Postconditions: publication receipt stored, published ID recorded, exact price/currency recorded, verification queued.

## 7. Verification Template
Compare the intended payload with the live channel result.
Record SKU, channel, market, published ID, live title, live price, live currency, live availability/status, timestamp, source commit/request ID and verification result.
Verification failure must not be treated as successful publication.

## 8. Operations Audit Template
Read-oriented by default. Record Railway health/readiness, API status, CI result, Evidence Gate counts, blocker counts, channel connection state, last successful sync, publication receipts and verification failures.

An audit may report a blocker; it must not silently bypass one.

## 9. Naming convention
Use `<template-id>/<entity-id>/<version>`.

Examples: `product-evidence/DERMAELLE007/v1`, `product-master/DERMAELLE007/v1`, `channel-listing/DERMAELLE007/shopify-EG/v1`, `verification/DERMAELLE007/shopify-EG/v1`.

## 10. Empire operating model
**Product Master → Template System → Evidence Gate → Channel Renderer → Publish → Verify**

## 11. Rollout strategy
Start with the smallest safe unit:
1. Product Evidence template.
2. Product Master template.
3. Egypt/EG market template.
4. Shopify channel template.
5. Verification template.
6. Replicate the validated pattern to remaining markets/channels.

This prevents the existing blocked catalog from becoming a bulk-publication operation.

## Files
- `config/template-system.json` — template registry and gate policy.
- `config/template-fields.json` — reusable field contracts.
- `config/catalog.schema.json` — canonical product contract.
- `config/markets.json` — 11-market contract.
- `docs/TEMPLATE-SYSTEM.md` — operating specification.

**PM COSMETICS HUB — templates accelerate execution; evidence controls publication.**
