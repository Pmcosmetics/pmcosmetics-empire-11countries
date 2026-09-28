# UI Consolidation Reference — Approved 1 + 2

This directory contains a preserved reference pack derived from the owner-approved items 1 and 2 in consolidation Issue #33.

## Scope
- Item 1: Egypt-first storefront UI reference from the former `apps/web` surface.
- Item 2: selected presentational components: ProductCard, FilterSidebar, Navbar, Footer.

## Safety
- Reference-only. Nothing here is imported by the live Express runtime.
- No old API, Prisma contract, authentication, cart, payment or mobile code was imported.
- No production routes, Supabase schema, Railway configuration or commercial gate were changed.
- The Commercial Publish Gate remains CLOSED.
- These files retain the old Next.js/axios assumptions intentionally so their provenance is preserved. They must be adapted to the live Product Master API before any future runtime use.

## Source repository
`shukrypeter102-arch/Pmcosmetics`

## Source files
- `apps/web/components/ProductCard.tsx`
- `apps/web/components/FilterSidebar.tsx`
- `apps/web/components/Navbar.tsx`
- `apps/web/components/Footer.tsx`
