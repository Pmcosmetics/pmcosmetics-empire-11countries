# PM Cosmetics Hub — Integration Architecture

## System of record

- Notion: Master Command Center for operational decisions, product data, channel readiness, and execution status.
- GitHub: Production source for application code, non-secret configuration, validation, and deployment workflows.
- OpenAI: AI execution layer for automation, content, validation, and structured operational assistance.

## Current repository baseline

Repository: `Pmcosmetics/Pm`
Default branch: `main`

Existing foundations:
- `app/`
- `config/`
- `data/`
- `docs/`
- `scripts/`
- `.github/workflows/pages.yml`
- `.github/workflows/validate.yml`

## Security boundary

Never commit OpenAI API keys, passwords, customer exports, payment credentials, or private ad credentials.
Use environment variables or platform secrets for credentials.

## Execution flow

```text
Notion Master Data
      |
      v
Validation / readiness checks
      |
      v
GitHub source + Actions
      |
      v
PM Cosmetics Hub deployment
      |
      v
OpenAI automation layer
      |
      v
Verified result -> Notion status
```

## First production slice

1. Validate repository structure and catalog schema.
2. Validate non-secret catalog data before publication.
3. Keep GitHub Pages deployment green.
4. Use OpenAI only through secure project credentials.
5. Record execution results and exceptions in Notion.

## Status

Baseline integration contract established on 2026-08-30. Detailed API automation is gated on secure credential availability and the final Notion data-source mapping.
