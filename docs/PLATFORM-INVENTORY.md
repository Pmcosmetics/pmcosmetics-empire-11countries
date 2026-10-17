# Platform Inventory — Review Draft

> **Status:** Draft for human review only  
> **Prepared:** 2026-10-17  
> **Scope:** Connection inventory and authorization status; no platform settings changed.  
> **Safety:** Global Commercial Publish Gate remains **CLOSED** by policy. This document does not authorize publishing, advertising, payment activation, bulk sync, account linking, or deployment.

## Status definitions

- **Connected / registry says verified:** Recorded as connected in `config/store-platform-account-registry.json`; this is not a fresh independent verification of the provider's live state.
- **Connected, direct verification pending:** Registry records a connection, but direct/provider-side verification is still needed.
- **Pending authorization / direct API:** A human must authorize or complete the provider-specific connection before treating it as connected.
- **Recorded by user, not present in registry:** Included from the accompanying user-provided status summary and requires confirmation against the provider or connector.

## Commerce and storefronts

| Platform | Recorded status | Next safe review step |
|---|---|---|
| Shopify | Connected/verified in registry; publication gate **CLOSED** | Read-only check of store identity and publication state; do not publish |
| WooCommerce | Pending authorization | Confirm intended store URL and obtain owner authorization |
| TikTok Shop | Pending authorization | Confirm seller account and obtain owner authorization |
| Amazon Seller Partner (Amazon SP) | Pending authorization | Confirm seller account and intended marketplace |
| Google Merchant Center | Pending authorization | Confirm account ownership and policy readiness |
| Salla | Pending direct API connection | Review existing app/API setup before creating anything |
| InstaShop | Pending direct API connection | Confirm exact business account and integration eligibility |
| Etsy | Pending direct API connection | Confirm shop ownership and connection status |
| Temu | Pending direct API connection | Confirm seller account and authorization requirements |
| Jumia | Pending direct API connection | Confirm seller account and marketplace |
| Talabat | Pending direct API connection | Confirm merchant account and integration scope |

## Advertising, social and messaging

| Platform | Recorded status | Next safe review step |
|---|---|---|
| Facebook | Connected/verified in registry | Read-only review of business ownership and assigned permissions |
| Instagram | Pending authorization in registry | Verify the intended professional account and Meta asset permissions |
| TikTok | Pending authorization in registry | Confirm account ownership and whether a business integration is needed |
| Google Ads | Connected/verified in registry; account ID `663-195-7015` | Read-only check of account access and billing status; do not launch campaigns |
| Google Business Profile | Connected/live but not directly verified in registry | Verify the business profile and primary phone with the owner |
| WhatsApp Business | Primary number recorded as `01055655649`; catalog URL recorded as [wa.me/c/201055655649](https://wa.me/c/201055655649) | Verify catalog destination and API status directly; registry says API verification is not independent |

## Operations, data and collaboration

| Platform | Recorded status | Next safe review step |
|---|---|---|
| GitHub | Active/verified in registry | Confirm repository access and review branch protections; do not merge |
| Railway | Active/verified in registry; deployment metadata is recorded there | Compare live health endpoint commit SHA with the deployed commit; no redeploy |
| Supabase | Registry says `ACTIVE_HEALTHY` | Read-only check of project health, RLS and data-source status |
| Airtable | Connected in registry | Confirm intended base and connector status without modifying records |
| Notion | Registry says workspace member verified for the primary identity | Confirm workspace access and intended project pages |
| Figma | Reported connected in the user-provided summary; not listed in this registry file | Verify the actual connected account/workspace before relying on it |
| Windsor.ai | Previously recorded as needing direct connection verification | Inspect connector list and account status; do not authorize new sources |
| Vercel | No project evidence identified in the reviewed files | Do not treat as a production host unless a project is found and verified |

## Catalog and publication controls

- Registry records `commercialPublishGate: CLOSED` and `noBulkPublishUntilEvidenceReady: true`.
- Registry records one publish-ready SKU: `DERMAELLE007`.
- **Count discrepancy to resolve:** the same registry records `blockedProducts: 73`. One ready product plus 73 blocked products implies 74 total records, while the working summary describes 73 total products. Reconcile the underlying evidence-gate count before using either total in reporting.
- The separate runtime flag `commercialCatalogLive` must not be interpreted as proof that the commercial publish gate is open. Public read access and permission to write/publish are different controls.
- No product publication, bulk synchronization, ad campaign, payment activation, or external account mutation is authorized by this inventory.

## Privacy and access

- Keep this inventory free of passwords, API keys, access tokens, recovery codes and personal account details not required for the review.
- Store any owner-specific contact directory in a private location with restricted access; do not copy it into a public repository.
- Treat registry statuses as dated records, not proof of current live connectivity.
- Human authorization is required before connecting pending platforms or granting new permissions.

## Review checklist

- [ ] Confirm which statuses were independently verified directly with each provider.
- [ ] Resolve the catalog total vs. blocked-count discrepancy.
- [ ] Compare Railway's live commit SHA to the intended release.
- [ ] Confirm whether public catalog endpoints should remain readable while the commercial publish gate is closed.
- [ ] Review this draft before any merge or publication.

---
This is an inventory draft only. It makes no production changes and does not authorize external writes.
