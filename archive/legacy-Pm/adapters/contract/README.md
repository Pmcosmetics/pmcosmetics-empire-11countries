# Channel Adapter Contract

Every channel adapter exposes a stable, idempotent boundary between Commerce Hub and a sales channel.

Required operations:
- `pushProduct(product, context)`
- `pushInventory(inventory, context)`
- `pushPrice(price, context)`
- `deleteProduct(externalProductId, context)`
- `handleOrderWebhook(request)`  (required by current assertAdapter implementation)

Signatures (recommended):
- `async pushProduct(product, context)`
  - product: object (see examples/fixtures)
  - context: { idempotencyKey?: string, attempt?: number, metadata?: object }
  - returns: `{ ok: boolean, mock?: boolean, ... }` or throws on fatal errors

Idempotency:
- Mutating calls (pushProduct/pushInventory/pushPrice/deleteProduct) MUST be idempotent when provided an `idempotencyKey` in `context`. The adapter should persist or otherwise deduplicate on that key where applicable.
- For mock/test skeletons it is sufficient to accept and echo `context.idempotencyKey` in the response (so contract-tests can assert acceptance).

Retry / 429 behavior:
- Channel APIs may return `429/Retry-After`. Clients should treat `429` as retryable.
- Adapters should implement exponential backoff/retry on transient failures, and surface non-retryable errors (4xx other than 429) as final.

Error semantics:
- `4xx`: client errors (invalid payload, unsupported operation)
- `429`: rate limited, retryable
- `5xx`: server error, possibly retryable depending on nature

Security / No production credentials:
- Adapters MUST NOT embed production credentials in the repository. CI & tests must run with fixtures/mocks only.
- Any real credentials must be supplied via secure environment secrets in runtime environments (not in the repo).

Examples & fixtures:
- See `services/adapters/shopify-skeleton/fixtures/product.example.json` for example payloads used by contract-tests.

Notes for implementers:
- Keep side effects predictable, accept an optional `context` with `idempotencyKey`.
- For testing, returning `{ ok: true, mock: true }` is acceptable.
