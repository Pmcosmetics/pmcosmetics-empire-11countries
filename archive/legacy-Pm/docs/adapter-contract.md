# PM Cosmetics Channel Adapter Contract

Adapters isolate marketplace/channel APIs from the Commerce Hub core.

## Required operations

- `pushProduct(product, context)`
- `pushInventory(inventory, context)`
- `pushPrice(price, context)`
- `deleteProduct(externalProductId, context)`
- `handleOrderWebhook(request, context)`

## Idempotency

Every mutating operation should accept a stable idempotency key. Retries with the same key must not create duplicate channel-side effects.

## Retry behavior

HTTP `429` is retryable. The adapter should honor a channel-provided retry delay when available and expose normalized retry metadata to the caller.

## Credentials

Production credentials are never committed to source control and are not required by contract tests or local fixtures.
