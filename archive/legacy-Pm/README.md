# PM Cosmetics Hub

Central repository for the PM Cosmetics Hub.

## Current status

This repository is intentionally starting clean. Before adding application code, we will validate the project structure, data sources, naming, configuration, security, and deployment workflow.

## Quality rules

- Keep production secrets and API keys out of Git.
- Use environment variables for credentials and private configuration.
- Keep canonical business data separate from application code.
- Validate imported catalog and ledger data before publishing.
- Use clear, consistent naming for PM Cosmetics Hub across supported markets.
- Make changes in small, reviewable commits.

## Planned structure

```text
app/          Application and storefront code
config/       Non-secret configuration and schemas
data/         Validated, non-secret source data
docs/         Architecture, operations, and business documentation
scripts/      Validation and maintenance scripts
.github/      CI/CD and repository automation
```

## First milestone

Establish a validated baseline before building features: repository structure, documentation, validation checks, security guardrails, and deployment foundations.
