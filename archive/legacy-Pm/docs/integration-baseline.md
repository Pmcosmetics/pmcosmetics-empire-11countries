# PM Cosmetics Hub — Integration Baseline

## Connected execution surfaces

- GitHub: `Pmcosmetics/Pm` (main)
- OpenAI Developers: API integration target
- Notion: documentation and operational knowledge target

## Execution rules

1. Keep API keys and production secrets out of Git.
2. Use environment variables for credentials.
3. Keep canonical business data separate from application code.
4. Validate catalog and ledger data before publishing.
5. Use `PM Cosmetics Hub` as the canonical project name.
6. Prefer small, reviewable commits.

## Integration sequence

1. Validate GitHub repository baseline.
2. Establish OpenAI API credential securely through the Platform setup flow.
3. Establish the Notion operational documentation surface.
4. Add automation only after the baseline is validated.
