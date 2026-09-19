# PM Cosmetics HuB — Master Registry

**Status:** CONTROLLED EXECUTION
**Canonical project name:** PM Cosmetics HuB
**Canonical code repository:** `Pmcosmetics/Pm`
**Default branch:** `main`

## 1. System of record

| Domain | System | Role | Rule |
|---|---|---|---|
| Application/code/workflows | GitHub | Technical source of truth | Changes must be committed and verified |
| Decisions/documentation | Notion | Command center | Record evidence before marking complete |
| Product/catalog operations | Airtable | Operational data layer | Do not promote generic base until schema is mapped |
| Customer/order channel | WhatsApp Business | Sales intake | Primary + backup routing |
| Commerce publication | Shopify | Sales execution | Verified products only |
| Creative | Canva | Creative production | Outputs link back to verified products |
| External analytics | CMS Open Data | Optional | Not part of cosmetics core |

## 2. Operational WhatsApp

- Primary/operational number: `01203151461`
- Secondary/backup number: `01055655649`

## 3. Current market map

1. Egypt
2. Saudi Arabia
3. United Arab Emirates
4. Kuwait
5. Qatar
6. Bahrain
7. Oman

## 4. Execution gates

`Backup → Validate → Execute → Verify → Rollback on failure`

A product may enter ACTIVE commerce only after identity, image, price, SKU/size where available, and stock/availability are verified.

## 5. Product pricing rule

- Retail catalog price = verified public/reference retail price.
- Wholesale price = verified retail price × `0.70`.
- Never guess a reference price.

## 6. Identity rule

Names such as `P.M Cosmetics`, `PM cosmetic`, or similar variants must not be treated as official PM Cosmetics HuB assets until ownership/evidence is verified.

## 7. Current product scope

Known stock-brand scope from the operating documentation includes: CeraVe, Vichy, La Roche-Posay, ACM, Uriage, Enavagen, Clarins, Télophil, Alba Pharm, The Ordinary, NIVEA, Bluebell, Majestic, Johnson’s, Clean & Clear, Zero Frizz, Eva, Di Belle, Bio Hair, Pharmaceris, Dermaseryas, DermanoVA, Rexona, Dove, plus Korean products in actual stock.

## 8. Completion standard

No task is considered complete without evidence from the target system. No destructive bulk changes are authorized by this registry alone.
