# PM COSMETICS HUB — Empire Integration Control — 2026-10-08

## Operating posture
- Scope: DERMAELLE007 only
- COMMERCIAL_PUBLISH_GATE: CLOSED
- Bulk publish: DISABLED
- Railway Runtime: NOT CERTIFIED
- Rule: connection != commercial approval; evidence -> validation -> authorization -> reversible pilot -> verification -> scale.

## Current verified integrations

| System | Role | Current evidence | Gate | Next control |
|---|---|---|---|---|
| GitHub | Source/code control | Canonical repo accessible with push permission | Operational / Gate closed | Keep evidence + CI authoritative |
| Shopify | Commerce source/store | Connected store; DERMAELLE007 is DRAFT, SKU DERMAELLE007, GTIN 6223007905060, 239 EGP, stock 48 | Closed | Product QA + controlled pilot only |
| Slack | Team ops/alerts | Workspace available; #all-pm confirmed | Closed | Use for decisions, alerts, approvals |
| Windsor.ai / Facebook | Meta Ads evidence | 3 connected ad accounts observed | Closed | Verify Business/Commerce/Catalog ownership separately |
| Microsoft Outlook | Operations email | Connector available | Evidence layer | Convert approvals into auditable evidence |

## Current connection dependencies

| System | State | Required action |
|---|---|---|
| WooCommerce | NOT VERIFIED / manual | Browser authorization + shop/API credentials, then read-only verification |
| Instagram | NOT VERIFIED / OAuth | Browser authorization, then asset/account verification |
| TikTok Shop | NOT VERIFIED / OAuth | Browser authorization, then country/commerce eligibility check |
| Snapchat | NOT VERIFIED / OAuth | Browser authorization, then business/catalog/tracking QA |
| Amazon Seller | NOT VERIFIED / OAuth | Browser authorization, then seller/account/catalog QA |
| Meta Business / Commerce | NOT VERIFIED | Verify Business Portfolio, ownership, permissions, catalog and commerce eligibility |
| Google Drive | Connector unavailable in current workspace | Use alternative official evidence store until admin enables it |
| Liner | NOT VERIFIED | Evidence-support only; not a commercial gate |
| MultiMessenger | NOT VERIFIED | Connect channels, test inbound/outbound, audit trail |
| iCloud | NOT VERIFIED | Evidence/backup only where needed |
| Telegram | NOT VERIFIED | Bot/channel ownership + send/receive test |
| ManyChat | NOT VERIFIED | Meta/Instagram connection + flow + opt-in/opt-out + handoff |
| Etsy Seller | Seller management not available through current connector | Seller authorization/application outside current connector; keep gate closed |

## Railway

The connected Railway account currently exposes 0 projects in this session. Therefore no Railway deployment, running SHA, /api/health, or live-sync certification is asserted from the current connection.

## DERMAELLE007 canonical working values
- Product: Dermaelle Hyalubalance Sebum Control Cleansing Gel 200ml
- SKU: DERMAELLE007
- GTIN: 6223007905060
- Public/pilot price: 239 EGP
- Recorded inventory baseline: 48 units
- Shopify status: DRAFT
- Commercial status: HOLD

## Economic control

Issue #90 and Issue #91 are the active P0 controls.
- Recorded acquisition cost: 260 EGP/unit
- Recorded public/pilot price: 239 EGP/unit
- Baseline difference: -21 EGP/unit before channel/payment/shipping/returns costs
- No automatic price change.
- No inferred cost substitution.
- Economic Approval requires direct PM cost evidence, SKU mapping reconciliation, channel-cost inputs, and explicit approval.

## Required integration sequence

1. Account / connector connection
2. Ownership + permissions
3. DERMAELLE007 mapping
4. Price / stock / content QA
5. Sync + reconciliation
6. Rollback test
7. Owner sign-off
8. Controlled one-product pilot decision

## Hard stops
- Any missing or contradictory product evidence => HOLD.
- Any missing channel ownership/permission evidence => HOLD.
- Any economic blocker => HOLD.
- Any price or stock drift without source evidence => HOLD.
- Missing current Railway runtime proof => Railway remains NOT CERTIFIED.
- Any request to bulk publish while the gate is CLOSED => reject/stop.
- No secrets may be committed to Git.

## Change control

This file is an operational registry update only. It does not open the commercial gate, change product price/stock, publish products, or certify Railway.